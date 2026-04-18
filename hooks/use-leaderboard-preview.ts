'use client'

import { useEffect, useState } from 'react'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { subscribeGlobalLeaderboard } from '@/lib/firebase/ranking'
import type { RankingEntry } from '@/lib/territory/types'

export function useLeaderboardPreview(max = 8) {
  const [entries, setEntries] = useState<RankingEntry[]>([])

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setEntries([])
      return
    }
    const unsub = subscribeGlobalLeaderboard((list) => {
      setEntries(list.slice(0, max))
    }, max)
    return () => {
      unsub?.()
    }
  }, [max])

  return entries
}
