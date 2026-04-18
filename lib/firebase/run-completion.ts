import {
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { getFirestoreDb } from './client'
import { isFirebaseConfigured } from './config'
import type { Territory } from '@/lib/territory/types'
import { SUZANO_BOUNDING_BOX, isPositionInsideBox } from '@/lib/territory/regions'
import { territoryToFirestoreDoc } from './territories'
import { computeXpFromRun } from '@/lib/territory/scoring'

const TERRITORIES = 'territories'
const USERS = 'users'
const PUBLIC_PROFILES = 'publicProfiles'
const RUNS = 'runs'

export interface CompletedRunPayload {
  territory: Territory
  runId: string
  userId: string
  startedAt: number
  endedAt: number
  distanceMeters: number
  durationSeconds: number
  /** GeoJSON LineString simplificado ou pontos serializados */
  routeJson: string
}

/**
 * Transação atómica: território + corrida + stats do utilizador (área, XP, distância, tempo).
 */
export async function saveCompletedRun(
  payload: CompletedRunPayload,
): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase não configurado.')
  }

  const { territory, runId, userId, startedAt, endedAt, distanceMeters, durationSeconds, routeJson } =
    payload

  if (!isPositionInsideBox(territory.center, SUZANO_BOUNDING_BOX)) {
    throw new Error('Território fora da área permitida.')
  }

  const xpGain = computeXpFromRun(distanceMeters, territory.areaM2)

  const db = getFirestoreDb()
  const territoryRef = doc(db, TERRITORIES, territory.id)
  const runRef = doc(db, RUNS, runId)
  const userRef = doc(db, USERS, userId)
  const publicProfileRef = doc(db, PUBLIC_PROFILES, userId)

  const territoryPayload = territoryToFirestoreDoc(territory)

  await runTransaction(db, async (trx) => {
    const uSnap = await trx.get(userRef)
    const prevArea = uSnap.exists()
      ? Number((uSnap.data() as { totalAreaM2?: number }).totalAreaM2 ?? 0)
      : 0
    const prevCount = uSnap.exists()
      ? Number((uSnap.data() as { territoriesCount?: number }).territoriesCount ?? 0)
      : 0
    const prevXp = uSnap.exists()
      ? Number((uSnap.data() as { xp?: number }).xp ?? 0)
      : 0
    const prevDist = uSnap.exists()
      ? Number((uSnap.data() as { totalDistanceM?: number }).totalDistanceM ?? 0)
      : 0
    const prevDur = uSnap.exists()
      ? Number((uSnap.data() as { totalDurationSeconds?: number }).totalDurationSeconds ?? 0)
      : 0

    trx.set(territoryRef, {
      ...territoryPayload,
      createdAt: territory.createdAt,
      updatedAt: territory.updatedAt,
    })

    trx.set(runRef, {
      userId,
      territoryId: territory.id,
      startedAt,
      endedAt,
      distanceMeters,
      durationSeconds,
      areaM2: territory.areaM2,
      xpGained: xpGain,
      routeJson,
      createdAt: serverTimestamp(),
    })

    const mergedStats = {
      totalAreaM2: prevArea + territory.areaM2,
      territoriesCount: prevCount + 1,
      xp: prevXp + xpGain,
      totalDistanceM: prevDist + distanceMeters,
      totalDurationSeconds: prevDur + durationSeconds,
      updatedAt: serverTimestamp(),
    }

    trx.set(userRef, mergedStats, { merge: true })
    trx.set(publicProfileRef, mergedStats, { merge: true })
  })
}
