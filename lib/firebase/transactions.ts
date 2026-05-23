import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import type { Feature, Polygon } from 'geojson'
import type { Territory } from '@/lib/territory/types'
import {
  geohashFieldsFromCenter,
  territoryToFirestoreDoc,
  type TerritoryFirestoreDoc,
} from '@/lib/firebase/territory-doc'
import { getAdminFirestore } from '@/lib/firebase/admin-app'
import { log } from '@/lib/logging/logger'
import { subtractPolygonOverlap } from '@/lib/territory/territory-generator'
import * as turf from '@turf/turf'

const TERRITORIES = 'territories'
const USERS = 'users'
const PUBLIC_PROFILES = 'publicProfiles'
const RUNS = 'runs'

const CAPTURABLE: Territory['status'][] = ['active', 'disputed', 'protected']

export interface CaptureRunPayload {
  runId: string
  startedAt: number
  endedAt: number
  distanceMeters: number
  durationSeconds: number
  routeJson: string
}

export interface ExecuteCaptureTransactionInput {
  attackerUid: string
  newTerritory: Territory
  xpCost: number
  xpGain: number
  overlappedTerritoryIds: string[]
  run: CaptureRunPayload
}

export type CaptureVictimOutcomeMode =
  | 'partial_shrink'
  | 'full_expire'
  | 'difference_failed'

export interface CaptureVictimOutcome {
  territoryId: string
  victimUid: string
  mode: CaptureVictimOutcomeMode
  lostAreaM2: number
  remainderAreaM2?: number
}

export class CaptureTransactionError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'OVERLAP_MISMATCH'
      | 'NOT_FOUND'
      | 'PROTECTED'
      | 'INVALID_OWNER'
      | 'INSUFFICIENT_XP',
  ) {
    super(message)
    this.name = 'CaptureTransactionError'
  }
}

/**
 * Transação atómica (Admin SDK): debita XP de conquista, reduz ou expira territórios
 * inimigos conforme área invadida, cria o novo território em `protected` e regista a corrida.
 */
export async function executeCaptureTransaction(
  input: ExecuteCaptureTransactionInput,
): Promise<CaptureVictimOutcome[]> {
  const {
    attackerUid,
    newTerritory,
    xpCost,
    xpGain,
    overlappedTerritoryIds,
    run,
  } = input

  const db = getAdminFirestore()
  const now = Date.now()
  const attackerPolygon = newTerritory.polygon

  const outcomes = await db.runTransaction(async (trx) => {
    const txOutcomes: CaptureVictimOutcome[] = []
    const attackerRef = db.collection(USERS).doc(attackerUid)
    const attackerPublicRef = db.collection(PUBLIC_PROFILES).doc(attackerUid)
    const territoryRef = db.collection(TERRITORIES).doc(newTerritory.id)
    const runRef = db.collection(RUNS).doc(run.runId)

    const attackerSnap = await trx.get(attackerRef)
    const prevXp = attackerSnap.exists
      ? Number((attackerSnap.data() as { xp?: number }).xp ?? 0)
      : 0
    const prevArea = attackerSnap.exists
      ? Number((attackerSnap.data() as { totalAreaM2?: number }).totalAreaM2 ?? 0)
      : 0
    const prevCount = attackerSnap.exists
      ? Number((attackerSnap.data() as { territoriesCount?: number }).territoriesCount ?? 0)
      : 0
    const prevDist = attackerSnap.exists
      ? Number((attackerSnap.data() as { totalDistanceM?: number }).totalDistanceM ?? 0)
      : 0
    const prevDur = attackerSnap.exists
      ? Number((attackerSnap.data() as { totalDurationSeconds?: number }).totalDurationSeconds ?? 0)
      : 0

    if (prevXp + xpGain < xpCost) {
      throw new CaptureTransactionError(
        'XP insuficiente para esta conquista.',
        'INSUFFICIENT_XP',
      )
    }

    const overlapRefs = overlappedTerritoryIds.map((id) =>
      db.collection(TERRITORIES).doc(id),
    )
    const overlapSnaps = await Promise.all(overlapRefs.map((r) => trx.get(r)))

    const victimAdjustments = new Map<string, { area: number; count: number }>()

    for (let i = 0; i < overlapSnaps.length; i++) {
      const snap = overlapSnaps[i]!
      const ref = overlapRefs[i]!
      const expectedId = overlappedTerritoryIds[i]!
      if (!snap.exists) {
        throw new CaptureTransactionError(
          `Território ${expectedId} não encontrado.`,
          'NOT_FOUND',
        )
      }
      const data = snap.data() as TerritoryFirestoreDoc
      if (data.userId === attackerUid) {
        throw new CaptureTransactionError(
          'Alvo de conquista inválido.',
          'INVALID_OWNER',
        )
      }
      if (!CAPTURABLE.includes(data.status)) {
        throw new CaptureTransactionError(
          'Território já não está disponível para conquista.',
          'OVERLAP_MISMATCH',
        )
      }
      const pu = data.protectedUntil
      if (pu !== undefined && pu > now) {
        throw new CaptureTransactionError(
          'Território alvo está protegido.',
          'PROTECTED',
        )
      }

      const victimPoly = JSON.parse(data.polygonJson) as Feature<Polygon>

      const subtraction = subtractPolygonOverlap(victimPoly, attackerPolygon)
      const victimId = data.userId
      const prev = victimAdjustments.get(victimId) ?? { area: 0, count: 0 }

      if (subtraction.fullCapture || !subtraction.remainder) {
        trx.update(ref, {
          status: 'expired',
          updatedAt: now,
        })
        victimAdjustments.set(victimId, {
          area: prev.area + data.areaM2,
          count: prev.count + 1,
        })
        txOutcomes.push({
          territoryId: expectedId,
          victimUid: victimId,
          mode: subtraction.intersectionAreaM2 > 0 ? 'full_expire' : 'difference_failed',
          lostAreaM2: data.areaM2,
        })
      } else {
        const centroid = turf.centroid(subtraction.remainder)
        const [centerLng, centerLat] = centroid.geometry.coordinates
        const { geohash, geohashPrefix } = geohashFieldsFromCenter(centerLat, centerLng)
        const nextStatus: Territory['status'] =
          data.status === 'active' ? 'disputed' : data.status

        trx.update(ref, {
          polygonJson: JSON.stringify(subtraction.remainder),
          areaM2: subtraction.remainderAreaM2,
          centerLng,
          centerLat,
          geohash,
          geohashPrefix,
          status: nextStatus,
          updatedAt: now,
        })
        victimAdjustments.set(victimId, {
          area: prev.area + subtraction.lostAreaM2,
          count: prev.count,
        })
        txOutcomes.push({
          territoryId: expectedId,
          victimUid: victimId,
          mode: 'partial_shrink',
          lostAreaM2: subtraction.lostAreaM2,
          remainderAreaM2: subtraction.remainderAreaM2,
        })
      }
    }

    for (const [victimUid, delta] of victimAdjustments) {
      const victimUserRef = db.collection(USERS).doc(victimUid)
      const victimPublicRef = db.collection(PUBLIC_PROFILES).doc(victimUid)
      trx.set(
        victimUserRef,
        {
          totalAreaM2: FieldValue.increment(-delta.area),
          territoriesCount: FieldValue.increment(-delta.count),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
      trx.set(
        victimPublicRef,
        {
          totalAreaM2: FieldValue.increment(-delta.area),
          territoriesCount: FieldValue.increment(-delta.count),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
    }

    const payload = territoryToFirestoreDoc(newTerritory)
    trx.set(territoryRef, {
      ...payload,
      createdAt: newTerritory.createdAt,
      updatedAt: newTerritory.updatedAt,
    })

    trx.set(runRef, {
      userId: attackerUid,
      territoryId: newTerritory.id,
      startedAt: run.startedAt,
      endedAt: run.endedAt,
      distanceMeters: run.distanceMeters,
      durationSeconds: run.durationSeconds,
      areaM2: newTerritory.areaM2,
      xpGained: xpGain,
      routeJson: run.routeJson,
      createdAt: FieldValue.serverTimestamp(),
    })

    const mergedStats = {
      totalAreaM2: prevArea + newTerritory.areaM2,
      territoriesCount: prevCount + 1,
      xp: prevXp + xpGain - xpCost,
      totalDistanceM: prevDist + run.distanceMeters,
      totalDurationSeconds: prevDur + run.durationSeconds,
      updatedAt: FieldValue.serverTimestamp(),
    }

    trx.set(attackerRef, mergedStats, { merge: true })
    trx.set(attackerPublicRef, mergedStats, { merge: true })

    return txOutcomes
  })

  for (const outcome of outcomes) {
    if (outcome.mode === 'partial_shrink') {
      log.info({
        scope: 'TerritoryCaptureTransaction',
        event: 'capture_victim_partial_shrink',
        territoryId: outcome.territoryId,
        victimUidPrefix: outcome.victimUid.slice(0, 8),
        lostAreaM2: Math.round(outcome.lostAreaM2),
        remainderAreaM2: Math.round(outcome.remainderAreaM2 ?? 0),
      })
    } else if (outcome.mode === 'full_expire') {
      log.info({
        scope: 'TerritoryCaptureTransaction',
        event: 'capture_victim_full_expire',
        territoryId: outcome.territoryId,
        victimUidPrefix: outcome.victimUid.slice(0, 8),
        lostAreaM2: Math.round(outcome.lostAreaM2),
      })
    } else {
      log.warn({
        scope: 'TerritoryCaptureTransaction',
        event: 'capture_difference_failed',
        territoryId: outcome.territoryId,
        victimUidPrefix: outcome.victimUid.slice(0, 8),
      })
    }
  }

  return outcomes
}
