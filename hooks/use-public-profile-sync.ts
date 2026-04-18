'use client'

import { useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase/client'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { useTerritoryStore } from '@/lib/store/territory-store'
import type { User } from '@/lib/territory/types'

/**
 * Mantém o utilizador atual (stats agregados do Firestore) na store de territórios.
 */
export function useCurrentUserPublicProfile(userId: string | undefined) {
  const upsertUser = useTerritoryStore((s) => s.upsertUser)

  useEffect(() => {
    if (!userId || !isFirebaseConfigured()) return
    const db = getFirestoreDb()
    const ref = doc(db, 'publicProfiles', userId)
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return
      const d = snap.data() as {
        displayName?: string
        color?: string
        totalAreaM2?: number
        territoriesCount?: number
        totalDistanceM?: number
        totalDurationSeconds?: number
        xp?: number
      }
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
    })
    return () => unsub()
  }, [userId, upsertUser])
}
