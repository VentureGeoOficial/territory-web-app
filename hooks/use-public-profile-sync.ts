'use client'

import { useEffect } from 'react'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { subscribePublicProfile } from '@/lib/firebase/user-profile'
import { useTerritoryStore } from '@/lib/store/territory-store'
import type { User } from '@/lib/territory/types'

/**
 * Mantém o utilizador atual (stats agregados do Firestore) na store de territórios.
 */
export function useCurrentUserPublicProfile(userId: string | undefined) {
  const upsertUser = useTerritoryStore((s) => s.upsertUser)

  useEffect(() => {
    if (!userId || !isFirebaseConfigured()) return
    const unsub = subscribePublicProfile(
      userId,
      (d) => {
        if (!d) return
        const u: User = {
          id: userId,
          displayName: d.displayName ?? 'Corredor',
          color: d.color ?? '#CCFF00',
          totalAreaM2: Number(d.totalAreaM2 ?? 0),
          territoriesCount: Number(d.territoriesCount ?? 0),
          totalDistanceM: Number(d.totalDistanceM ?? 0),
          totalDurationSeconds: Number(d.totalDurationSeconds ?? 0),
          createdAt: Date.now(),
          lastActiveAt: Date.now(),
        }
        upsertUser(u)
      },
      (err) => {
        const ts = new Date().toISOString()
        console.error(`[${ts}] [ERROR] [useCurrentUserPublicProfile]`, {
          source: 'hooks/use-public-profile-sync.ts',
          userId,
          message: err.message,
        })
      },
    )
    return () => unsub?.()
  }, [userId, upsertUser])
}
