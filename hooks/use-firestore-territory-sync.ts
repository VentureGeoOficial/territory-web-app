'use client'

import { useEffect } from 'react'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { subscribeTerritories } from '@/lib/firebase/territories'
import { useTerritoryStore } from '@/lib/store/territory-store'
import type { Territory, User } from '@/lib/territory/types'

function deriveUsersFromTerritories(territories: Territory[]): User[] {
  const byUser = new Map<string, Territory[]>()
  for (const t of territories) {
    const list = byUser.get(t.userId) ?? []
    list.push(t)
    byUser.set(t.userId, list)
  }
  const users: User[] = []
  for (const [userId, ts] of byUser) {
    const totalArea = ts.reduce((s, t) => s + t.areaM2, 0)
    users.push({
      id: userId,
      displayName: ts[0]?.userName ?? 'Corredor',
      email: undefined,
      color: ts[0]?.userColor ?? '#CCFF00',
      totalAreaM2: totalArea,
      territoriesCount: ts.length,
      totalDistanceM: 0,
      totalDurationSeconds: 0,
      createdAt: Math.min(...ts.map((t) => t.createdAt)),
      lastActiveAt: Date.now(),
    })
  }
  return users
}

/** Sincroniza territórios e lista derivada de utilizadores a partir do Firestore. */
export function useFirestoreTerritorySync() {
  const setTerritories = useTerritoryStore((s) => s.setTerritories)
  const setUsers = useTerritoryStore((s) => s.setUsers)

  useEffect(() => {
    if (!isFirebaseConfigured()) return
    const unsub = subscribeTerritories(
      (list) => {
        setTerritories(list)
        setUsers(deriveUsersFromTerritories(list))
      },
      (err) => console.error('[Firestore territories]', err),
    )
    return () => {
      unsub?.()
    }
  }, [setTerritories, setUsers])
}
