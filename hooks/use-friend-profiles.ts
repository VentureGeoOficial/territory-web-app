'use client'

import { useEffect, useState } from 'react'
import {
  subscribePublicProfile,
  type PublicProfileSnapshotData,
} from '@/lib/firebase/user-profile'
import { isFirebaseConfigured } from '@/lib/firebase/config'

/**
 * Mapa uid → dados públicos (subscrição em tempo real por utilizador).
 * Usado para nomes/cores em pedidos de amizade e lista de amigos.
 */
export function useFriendProfiles(uids: string[]): Map<string, PublicProfileSnapshotData> {
  const [map, setMap] = useState<Map<string, PublicProfileSnapshotData>>(new Map())

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setMap(new Map())
      return
    }

    const unique = [...new Set(uids.filter(Boolean))].sort()
    if (unique.length === 0) {
      setMap(new Map())
      return
    }

    setMap(new Map())
    const unsubs: (() => void)[] = []

    for (const uid of unique) {
      const unsub = subscribePublicProfile(uid, (data) => {
        setMap((prev) => {
          const next = new Map(prev)
          /* Doc ausente: marcamos entrada vazia para não bloquear o loading indefinidamente. */
          next.set(uid, data ?? {})
          return next
        })
      })
      if (unsub) unsubs.push(unsub)
    }

    return () => {
      unsubs.forEach((u) => u())
    }
  }, [uids.join('|')])

  return map
}
