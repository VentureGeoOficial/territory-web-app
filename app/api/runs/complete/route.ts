import { NextResponse } from 'next/server'
import { z } from 'zod'

import { assertRunRateLimit, RunRateLimitError } from '@/lib/api/run-rate-limit'
import { ApiAuthError, verifyAuthOrFail } from '@/lib/firebase/admin-auth'
import { executeNormalRunCompleteTransaction } from '@/lib/firebase/admin-normal-run'
import { getIdempotentRunResult } from '@/lib/firebase/idempotent-run'
import { queryTerritoriesForGameplay } from '@/lib/firebase/admin-territories-query'
import { firestoreUserDocToDomainUser } from '@/lib/firebase/admin-user-map'
import { getAdminFirestore } from '@/lib/firebase/admin-app'
import { createTerritoryFromRunTrack } from '@/lib/territory/run-territory'
import { hasEnemyCaptureOverlap } from '@/lib/territory/geoLogic'
import type { TrackPoint } from '@/lib/territory/types'
import { isPositionInsideBox, SUZANO_BOUNDING_BOX } from '@/lib/territory/regions'
import { log } from '@/lib/logging/logger'

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
  runId: z.string().uuid(),
  points: z.array(trackPointSchema).min(2),
  startedAt: z.number(),
  endedAt: z.number(),
  distanceMeters: z.number().nonnegative(),
  durationSeconds: z.number().nonnegative(),
  routeJson: z.string().max(400_000),
})

function resolveRunId(req: Request, bodyRunId: string): string {
  const header = req.headers.get('idempotency-key')?.trim()
  return header && header.length > 0 ? header : bodyRunId
}

export async function POST(req: Request) {
  try {
    const { uid } = await verifyAuthOrFail(req)

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
    const runId = resolveRunId(req, body.runId)

    log.info({
      scope: 'RunCompleteApi',
      event: 'request_start',
      uid,
      runIdPrefix: runId.slice(0, 8),
      pointCount: body.points.length,
    })

    const existing = await getIdempotentRunResult(runId)
    if (existing) {
      log.info({
        scope: 'RunCompleteApi',
        event: 'idempotent_hit',
        uid,
        runIdPrefix: runId.slice(0, 8),
      })
      return NextResponse.json(existing)
    }

    if (body.endedAt <= body.startedAt) {
      return NextResponse.json({ error: 'Intervalo de tempo inválido.' }, { status: 400 })
    }

    await assertRunRateLimit(uid)

    const points = body.points as TrackPoint[]
    const db = getAdminFirestore()
    const userSnap = await db.collection('users').doc(uid).get()

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 400 })
    }

    const currentUser = firestoreUserDocToDomainUser(uid, userSnap.data() ?? {})
    const existingTerritories = await queryTerritoriesForGameplay()

    let newTerritory
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
      log.warn({
        scope: 'RunCompleteApi',
        event: 'validation_failed',
        uid,
        message: msg,
      })
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

    if (
      hasEnemyCaptureOverlap(
        newTerritory.polygon,
        existingTerritories,
        uid,
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Sobreposição com território inimigo: use o fluxo de conquista no mapa.',
          code: 'ENEMY_OVERLAP_USE_CAPTURE',
        },
        { status: 409 },
      )
    }

    await executeNormalRunCompleteTransaction({
      territory: newTerritory,
      runId,
      userId: uid,
      startedAt: body.startedAt,
      endedAt: body.endedAt,
      distanceMeters: body.distanceMeters,
      durationSeconds: body.durationSeconds,
      routeJson: body.routeJson,
    })

    log.info({
      scope: 'RunCompleteApi',
      event: 'success',
      uid,
      territoryId: newTerritory.id,
      areaM2: Math.round(newTerritory.areaM2),
    })

    return NextResponse.json({
      territoryId: newTerritory.id,
      runId,
    })
  } catch (e) {
    if (e instanceof ApiAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    if (e instanceof RunRateLimitError) {
      return NextResponse.json({ error: e.message, code: 'RATE_LIMIT' }, { status: 429 })
    }
    if (e instanceof Error && e.message.includes('FIREBASE_SERVICE_ACCOUNT')) {
      return NextResponse.json(
        { error: 'Servidor não configurado para persistir corridas.' },
        { status: 503 },
      )
    }
    const message = e instanceof Error ? e.message : 'Erro interno.'
    log.error({
      scope: 'RunCompleteApi',
      event: 'failure',
      message,
    })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
