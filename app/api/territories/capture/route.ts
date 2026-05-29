import { NextResponse } from 'next/server'
import { z } from 'zod'

import { assertRunRateLimit, RunRateLimitError } from '@/lib/api/run-rate-limit'
import { ApiAuthError, verifyAuthOrFail } from '@/lib/firebase/admin-auth'
import { getIdempotentRunResult } from '@/lib/firebase/idempotent-run'
import { queryTerritoriesForGameplay } from '@/lib/firebase/admin-territories-query'
import { getFriendOwnerIds } from '@/lib/firebase/admin-friendship'
import { firestoreUserDocToDomainUser } from '@/lib/firebase/admin-user-map'
import { getAdminFirestore } from '@/lib/firebase/admin-app'
import {
  CaptureTransactionError,
  executeCaptureTransaction,
} from '@/lib/firebase/transactions'
import { computeXpFromRun } from '@/lib/territory/scoring'
import {
  calculateCaptureImpact,
  CAPTURE_PROTECTION_MS,
} from '@/lib/territory/geoLogic'
import { createTerritoryFromRunTrack } from '@/lib/territory/run-territory'
import { CAPTURE_REACTION_EMOJIS } from '@/lib/territory/capture-reactions'
import type { Territory, TrackPoint } from '@/lib/territory/types'
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
  reactionEmoji: z.enum(CAPTURE_REACTION_EMOJIS),
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
      scope: 'TerritoryCaptureApi',
      event: 'request_start',
      uid,
      runIdPrefix: runId.slice(0, 8),
    })

    const existing = await getIdempotentRunResult(runId)
    if (existing) {
      return NextResponse.json(existing)
    }

    await assertRunRateLimit(uid)

    const points = body.points as TrackPoint[]
    const db = getAdminFirestore()

    const [userSnap, existingTerritories, friendOwnerIds] = await Promise.all([
      db.collection('users').doc(uid).get(),
      queryTerritoriesForGameplay(),
      getFriendOwnerIds(uid),
    ])

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 400 })
    }

    const currentUser = firestoreUserDocToDomainUser(uid, userSnap.data() ?? {})

    let newTerritory: Territory
    try {
      const result = createTerritoryFromRunTrack({
        points,
        currentUserId: uid,
        currentUser,
        existingTerritories,
        friendOwnerIds,
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
      friendOwnerIds,
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
            'Sem sobreposição com território de amigo. Use o fluxo normal de finalizar corrida.',
          code: 'NO_FRIEND_OVERLAP',
        },
        { status: 400 },
      )
    }

    const xpGain = computeXpFromRun(body.distanceMeters, territoryForCapture.areaM2)

    const victimOutcomes = await executeCaptureTransaction({
      attackerUid: uid,
      attackerName: currentUser.displayName,
      newTerritory: territoryForCapture,
      xpCost: impact.xpCost,
      xpGain,
      overlappedTerritoryIds: impact.overlappedTerritoryIds,
      friendOwnerIds,
      reactionEmoji: body.reactionEmoji,
      run: {
        runId,
        startedAt: body.startedAt,
        endedAt: body.endedAt,
        distanceMeters: body.distanceMeters,
        durationSeconds: body.durationSeconds,
        routeJson: body.routeJson,
      },
    })

    log.info({
      scope: 'TerritoryCaptureApi',
      event: 'success',
      uid,
      territoryId: territoryForCapture.id,
      victimOutcomeCount: victimOutcomes.length,
      partialShrinkCount: victimOutcomes.filter((o) => o.mode === 'partial_shrink').length,
    })

    return NextResponse.json({
      territoryId: territoryForCapture.id,
      runId,
      xpCost: impact.xpCost,
      xpGain,
      totalOverlappingAreaM2: impact.totalOverlappingAreaM2,
    })
  } catch (e) {
    if (e instanceof ApiAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    if (e instanceof RunRateLimitError) {
      return NextResponse.json({ error: e.message, code: 'RATE_LIMIT' }, { status: 429 })
    }
    if (e instanceof CaptureTransactionError) {
      const status =
        e.code === 'INSUFFICIENT_XP'
          ? 402
          : e.code === 'PROTECTED' || e.code === 'NOT_FRIEND'
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
    log.error({ scope: 'TerritoryCaptureApi', event: 'failure', message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
