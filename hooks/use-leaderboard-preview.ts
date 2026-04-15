'use client'

import { useEffect, useState } from 'react'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { subscribeGlobalLeaderboard } from '@/lib/firebase/ranking'
import { useTerritoryStore } from '@/lib/store/territory-store'
import type { RankingEntry } from '@/lib/territory/types'

function buildFromTerritoryStore(): RankingEntry[] {
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

export function useLeaderboardPreview(max = 8) {
  const users = useTerritoryStore((s) => s.users)
  const territories = useTerritoryStore((s) => s.territories)
  const [entries, setEntries] = useState<RankingEntry[]>([])

  useEffect(() => {
    if (isFirebaseConfigured()) return
    setEntries(buildFromTerritoryStore().slice(0, max))
  }, [max, users, territories])

  useEffect(() => {
    if (!isFirebaseConfigured()) return
    const unsub = subscribeGlobalLeaderboard((list) => {
      setEntries(list.slice(0, max))
    }, max)
    return () => {
      unsub?.()
    }
  }, [max])

  return entries
}
