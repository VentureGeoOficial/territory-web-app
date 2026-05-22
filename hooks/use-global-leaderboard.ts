'use client'

import { useEffect, useState } from 'react'
import { useTerritoryStore } from '@/lib/store/territory-store'
import type { RankingEntry } from '@/lib/territory/types'
import { getLeaderboardRepository } from '@/lib/data/territory-repository'

function buildFromStore(): RankingEntry[] {
  const { users } = useTerritoryStore.getState()
  const sorted = [...users].sort(
    (a, b) => b.territoriesCount - a.territoriesCount || a.displayName.localeCompare(b.displayName, 'pt-BR'),
  )
  return sorted.map((u, i) => ({
    userId: u.id,
    userName: u.displayName,
    userColor: u.color,
    xp: 0,
    territoriesCount: u.territoriesCount,
    rank: i + 1,
  }))
}

export function useGlobalLeaderboard(limit = 50) {
  const [entries, setEntries] = useState<RankingEntry[]>([])

  useEffect(() => {
    const repo = getLeaderboardRepository()
    if (!repo) {
      setEntries([])
      return
    }
    const unsub = repo.subscribeGlobalLeaderboard(setEntries, limit)
    return () => unsub?.()
  }, [limit])

  return entries
}
