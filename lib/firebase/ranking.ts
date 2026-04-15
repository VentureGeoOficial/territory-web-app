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
import type { RankingEntry } from '@/lib/territory/types'

const USERS = 'users'

export function subscribeGlobalLeaderboard(
  onUpdate: (entries: RankingEntry[]) => void,
  max = 50,
): Unsubscribe | null {
  if (!isFirebaseConfigured()) return null
  const db = getFirestoreDb()
  const q = query(
    collection(db, USERS),
    orderBy('totalAreaM2', 'desc'),
    limit(max),
  )
  return onSnapshot(q, (snap) => {
    const entries: RankingEntry[] = []
    let rank = 1
    snap.forEach((d) => {
      const data = d.data() as {
        displayName?: string
        color?: string
        totalAreaM2?: number
        territoriesCount?: number
      }
      entries.push({
        userId: d.id,
        userName: data.displayName ?? 'Corredor',
        userColor: data.color ?? '#CCFF00',
        totalAreaM2: Number(data.totalAreaM2 ?? 0),
        territoriesCount: Number(data.territoriesCount ?? 0),
        rank: rank++,
      })
    })
    onUpdate(entries)
  })
}
