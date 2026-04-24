import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin-app'
import {
  CaptureTransactionError,
  executeCaptureTransaction,
} from '@/lib/firebase/transactions'
import {
  firestoreDocToTerritory,
  type TerritoryFirestoreDoc,
} from '@/lib/firebase/territory-doc'
import { computeXpFromRun } from '@/lib/territory/scoring'
import {
  calculateCaptureImpact,
  CAPTURE_PROTECTION_MS,
} from '@/lib/territory/geoLogic'
import { createTerritoryFromRunTrack } from '@/lib/territory/run-territory'
import type { Territory, TrackPoint, User } from '@/lib/territory/types'
import { isPositionInsideBox, SUZANO_BOUNDING_BOX } from '@/lib/territory/regions'

const MAX_AREA_M2 = 10_000_000

const trackPointSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timestamp: z.number(),
  accuracy: z.number().optional(),
  altitude: z.number().optional(),
  speed: z.number().optional(),
})

const bodySchema = z.object({
  points: z.array(trackPointSchema).min(2),
  startedAt: z.number(),
  endedAt: z.number(),
  distanceMeters: z.number().nonnegative(),
  durationSeconds: z.number().nonnegative(),
  routeJson: z.string().max(400_000),
})

function userDocToDomainUser(uid: string, data: Record<string, unknown>): User {
  return {
    id: uid,
    displayName: String(data.displayName ?? 'Corredor'),
    email: data.email !== undefined ? String(data.email) : undefined,
    color: String(data.color ?? '#CCFF00'),
    totalAreaM2: Number(data.totalAreaM2 ?? 0),
    territoriesCount: Number(data.territoriesCount ?? 0),
    totalDistanceM: Number(data.totalDistanceM ?? 0),
    totalDurationSeconds: Number(data.totalDurationSeconds ?? 0),
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : null
    if (!token) {
      return NextResponse.json({ error: 'Token em falta.' }, { status: 401 })
    }

    let uid: string
    try {
      const decoded = await getAdminAuth().verifyIdToken(token)
      uid = decoded.uid
    } catch {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 401 })
    }

    let json: unknown
    try {
      json = await req.json()
    } catch {
      return NextResponse.json({ error: 'Corpo JSON inválido.' }, { status: 400 })
    }

    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Pedido inválido.', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const body = parsed.data
    const points = body.points as TrackPoint[]
    const db = getAdminFirestore()

    const [userSnap, territoriesSnap] = await Promise.all([
      db.collection('users').doc(uid).get(),
      db.collection('territories').get(),
    ])

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 400 })
    }

    const existingTerritories: Territory[] = territoriesSnap.docs.map((d) =>
      firestoreDocToTerritory(d.id, d.data() as TerritoryFirestoreDoc),
    )

    const currentUser = userDocToDomainUser(uid, userSnap.data() ?? {})

    let newTerritory: Territory
    try {
      const result = createTerritoryFromRunTrack({
        points,
        currentUserId: uid,
        currentUser,
        existingTerritories,
        nowMs: Date.now(),
      })
      newTerritory = result.newTerritory
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Validação da corrida falhou.'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    if (!isPositionInsideBox(newTerritory.center, SUZANO_BOUNDING_BOX)) {
      return NextResponse.json(
        { error: 'Território fora da área permitida.' },
        { status: 400 },
      )
    }

    if (newTerritory.areaM2 <= 0 || newTerritory.areaM2 > MAX_AREA_M2) {
      return NextResponse.json({ error: 'Área inválida.' }, { status: 400 })
    }

    const now = Date.now()
    const territoryForCapture: Territory = {
      ...newTerritory,
      status: 'protected',
      protectedUntil: now + CAPTURE_PROTECTION_MS,
      updatedAt: now,
    }

    const impact = calculateCaptureImpact(
      territoryForCapture.polygon,
      existingTerritories,
      uid,
      now,
    )

    if (!impact.ok) {
      return NextResponse.json(
        { error: impact.message, code: 'PROTECTED' },
        { status: 403 },
      )
    }

    if (impact.overlappedTerritoryIds.length === 0) {
      return NextResponse.json(
        {
          error:
            'Sem sobreposição inimiga. Use o fluxo normal de finalizar corrida.',
          code: 'NO_ENEMY_OVERLAP',
        },
        { status: 400 },
      )
    }

    const xpGain = computeXpFromRun(body.distanceMeters, territoryForCapture.areaM2)
    const runId = crypto.randomUUID()

    await executeCaptureTransaction({
      attackerUid: uid,
      newTerritory: territoryForCapture,
      xpCost: impact.xpCost,
      xpGain,
      overlappedTerritoryIds: impact.overlappedTerritoryIds,
      run: {
        runId,
        startedAt: body.startedAt,
        endedAt: body.endedAt,
        distanceMeters: body.distanceMeters,
        durationSeconds: body.durationSeconds,
        routeJson: body.routeJson,
      },
    })

    return NextResponse.json({
      territoryId: territoryForCapture.id,
      runId,
      xpCost: impact.xpCost,
      xpGain,
      totalOverlappingAreaM2: impact.totalOverlappingAreaM2,
    })
  } catch (e) {
    if (e instanceof CaptureTransactionError) {
      const status =
        e.code === 'INSUFFICIENT_XP'
          ? 402
          : e.code === 'PROTECTED'
            ? 403
            : e.code === 'NOT_FOUND'
              ? 409
              : 400
      return NextResponse.json({ error: e.message, code: e.code }, { status })
    }
    if (e instanceof Error && e.message.includes('FIREBASE_SERVICE_ACCOUNT')) {
      return NextResponse.json(
        { error: 'Servidor não configurado para captura.' },
        { status: 503 },
      )
    }
    const message = e instanceof Error ? e.message : 'Erro interno.'
    console.error(e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
