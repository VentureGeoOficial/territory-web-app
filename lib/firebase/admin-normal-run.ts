import 'server-only'

import { FieldValue } from 'firebase-admin/firestore'

import { getAdminFirestore } from '@/lib/firebase/admin-app'
import { territoryToFirestoreDoc } from '@/lib/firebase/territory-doc'
import type { Territory } from '@/lib/territory/types'
import { computeXpFromRun } from '@/lib/territory/scoring'

const TERRITORIES = 'territories'
const USERS = 'users'
const PUBLIC_PROFILES = 'publicProfiles'
const RUNS = 'runs'

export interface NormalRunCompleteInput {
  territory: Territory
  runId: string
  userId: string
  startedAt: number
  endedAt: number
  distanceMeters: number
  durationSeconds: number
  routeJson: string
}

/**
 * Transação Admin: território + corrida + stats (fluxo normal, sem conquista hostil).
 */
export async function executeNormalRunCompleteTransaction(
  payload: NormalRunCompleteInput,
): Promise<void> {
  const {
    territory,
    runId,
    userId,
    startedAt,
    endedAt,
    distanceMeters,
    durationSeconds,
    routeJson,
  } = payload

  const xpGain = computeXpFromRun(distanceMeters, territory.areaM2)

  const db = getAdminFirestore()
  const territoryRef = db.collection(TERRITORIES).doc(territory.id)
  const runRef = db.collection(RUNS).doc(runId)
  const userRef = db.collection(USERS).doc(userId)
  const publicProfileRef = db.collection(PUBLIC_PROFILES).doc(userId)

  const territoryPayload = territoryToFirestoreDoc(territory)

  await db.runTransaction(async (trx) => {
    const uSnap = await trx.get(userRef)
    const prevArea = uSnap.exists
      ? Number((uSnap.data() as { totalAreaM2?: number }).totalAreaM2 ?? 0)
      : 0
    const prevCount = uSnap.exists
      ? Number((uSnap.data() as { territoriesCount?: number }).territoriesCount ?? 0)
      : 0
    const prevXp = uSnap.exists
      ? Number((uSnap.data() as { xp?: number }).xp ?? 0)
      : 0
    const prevDist = uSnap.exists
      ? Number((uSnap.data() as { totalDistanceM?: number }).totalDistanceM ?? 0)
      : 0
    const prevDur = uSnap.exists
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
      createdAt: FieldValue.serverTimestamp(),
    })

    const mergedStats = {
      totalAreaM2: prevArea + territory.areaM2,
      territoriesCount: prevCount + 1,
      xp: prevXp + xpGain,
      totalDistanceM: prevDist + distanceMeters,
      totalDurationSeconds: prevDur + durationSeconds,
      updatedAt: FieldValue.serverTimestamp(),
    }

    trx.set(userRef, mergedStats, { merge: true })
    trx.set(publicProfileRef, mergedStats, { merge: true })
  })
}
