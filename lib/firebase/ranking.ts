import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirestoreDb } from './client'
import { isFirebaseConfigured } from './config'
import { log } from '@/lib/logging/logger'
import type { RankingEntry } from '@/lib/territory/types'

const PUBLIC_PROFILES = 'publicProfiles'

function normalizeXp(raw: unknown, userId: string): number {
  const n = Number(raw ?? 0)
  if (!Number.isFinite(n) || Number.isNaN(n)) {
    log.warn({
      scope: 'RankingService',
      event: 'leaderboard_invalid_xp',
      userId,
      raw: typeof raw,
    })
    return 0
  }
  return Math.max(0, Math.floor(n))
}

export function subscribeGlobalLeaderboard(
  onUpdate: (entries: RankingEntry[]) => void,
  max = 50,
): Unsubscribe | null {
  if (!isFirebaseConfigured()) return null
  const db = getFirestoreDb()
  const q = query(
    collection(db, PUBLIC_PROFILES),
    orderBy('xp', 'desc'),
    limit(max),
  )
  let loggedFirstUpdate = false

  return onSnapshot(
    q,
    (snap) => {
      const entries: RankingEntry[] = []
      let rank = 1
      snap.forEach((d) => {
        const data = d.data() as {
          displayName?: string
          color?: string
          xp?: number
          territoriesCount?: number
        }
        entries.push({
          userId: d.id,
          userName: data.displayName ?? 'Corredor',
          userColor: data.color ?? '#CCFF00',
          xp: normalizeXp(data.xp, d.id),
          territoriesCount: Number(data.territoriesCount ?? 0),
          rank: rank++,
        })
      })
      if (!loggedFirstUpdate) {
        loggedFirstUpdate = true
        log.info({
          scope: 'RankingService',
          event: 'leaderboard_updated',
          count: entries.length,
          source: 'lib/firebase/ranking.ts',
        })
      }
      onUpdate(entries)
    },
    (err) => {
      log.error({
        scope: 'RankingService',
        event: 'leaderboard_subscribe_failed',
        message: err.message,
        source: 'lib/firebase/ranking.ts',
      })
      onUpdate([])
    },
  )
}
