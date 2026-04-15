'use client'

import { useEffect, useState } from 'react'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { subscribeGlobalLeaderboard } from '@/lib/firebase/ranking'
import { useTerritoryStore } from '@/lib/store/territory-store'
import type { RankingEntry } from '@/lib/territory/types'

function buildFromStore(): RankingEntry[] {
  const { users } = useTerritoryStore.getState()
  const sorted = [...users].sort(
    (a, b) => b.totalAreaM2 - a.totalAreaM2 || b.territoriesCount - a.territoriesCount,
  )
  return sorted.map((u, i) => ({
    userId: u.id,
    userName: u.displayName,
    userColor: u.color,
    totalAreaM2: u.totalAreaM2,
    territoriesCount: u.territoriesCount,
    rank: i + 1,
  }))
}

export function useGlobalLeaderboard(limit = 50) {
  const users = useTerritoryStore((s) => s.users)
  const territories = useTerritoryStore((s) => s.territories)
  const [entries, setEntries] = useState<RankingEntry[]>([])

  useEffect(() => {
    if (isFirebaseConfigured()) return
    setEntries(buildFromStore().slice(0, limit))
  }, [limit, users, territories])

  useEffect(() => {
    if (!isFirebaseConfigured()) return
    const unsub = subscribeGlobalLeaderboard(setEntries, limit)
    return () => unsub?.()
  }, [limit])

  return entries
}
