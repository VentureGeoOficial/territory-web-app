'use client'

import {
  collection,
  limit,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase/client'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { log } from '@/lib/logging/logger'
import type { RunRecord } from '@/lib/dashboard/types'

const RUNS = 'runs'

function mapRunDoc(id: string, data: Record<string, unknown>): RunRecord | null {
  const userId = data.userId
  if (typeof userId !== 'string') return null
  return {
    id,
    distanceMeters: Number(data.distanceMeters ?? 0),
    durationSeconds: Number(data.durationSeconds ?? 0),
    startedAt: Number(data.startedAt ?? 0),
    endedAt: Number(data.endedAt ?? 0),
    areaM2: Number(data.areaM2 ?? 0),
    xpGained: Number(data.xpGained ?? 0),
  }
}

/**
 * Subscrição às corridas do utilizador (somente leitura; rules: owner read).
 * Ordenação por endedAt no cliente (v1 sem índice composto).
 */
export function subscribeUserRuns(
  uid: string,
  onData: (runs: RunRecord[]) => void,
  onError?: (error: Error) => void,
  maxDocs = 100,
): Unsubscribe | null {
  if (!isFirebaseConfigured() || !uid) return null

  const db = getFirestoreDb()
  const q = query(
    collection(db, RUNS),
    where('userId', '==', uid),
    limit(maxDocs),
  )

  return onSnapshot(
    q,
    (snap) => {
      const runs: RunRecord[] = []
      for (const docSnap of snap.docs) {
        const mapped = mapRunDoc(docSnap.id, docSnap.data() as Record<string, unknown>)
        if (mapped) runs.push(mapped)
      }
      runs.sort((a, b) => b.endedAt - a.endedAt)
      onData(runs)
    },
    (err) => {
      log.error({
        scope: 'dashboard-runs',
        event: 'subscribe_error',
        uid,
        message: err.message,
      })
      onError?.(err)
    },
  )
}
