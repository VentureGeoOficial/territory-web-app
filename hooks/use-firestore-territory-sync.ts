'use client'

import { useEffect, useMemo } from 'react'
import { useTerritoryStore } from '@/lib/store/territory-store'
import type { Territory, User } from '@/lib/territory/types'
import { getTerritoryRepository } from '@/lib/data/territory-repository'
import { useAuthStore } from '@/lib/store/auth-store'
import { useFriendIds } from '@/hooks/use-friend-ids'
import { log } from '@/lib/logging/logger'

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

function mergeDerivedWithExisting(derived: User[], existing: User[]): User[] {
  const merged = derived.map((d) => {
    const p = existing.find((u) => u.id === d.id)
    if (!p) return d
    return {
      ...d,
      displayName: p.displayName || d.displayName,
      color: p.color || d.color,
      totalAreaM2: p.totalAreaM2,
      territoriesCount: p.territoriesCount,
      totalDistanceM: p.totalDistanceM,
      totalDurationSeconds: p.totalDurationSeconds,
    }
  })
  const ids = new Set(merged.map((u) => u.id))
  const extra = existing.filter((u) => !ids.has(u.id))
  return [...merged, ...extra]
}

/**
 * Sincroniza territórios visíveis (próprio + amigos aceites) e utilizadores derivados.
 * Re-subscreve quando o conjunto de amigos muda.
 */
export function useFirestoreTerritorySync() {
  const uid = useAuthStore((s) => s.user?.id)
  const friendIds = useFriendIds()
  const setTerritories = useTerritoryStore((s) => s.setTerritories)
  const setUsers = useTerritoryStore((s) => s.setUsers)

  const visibleUserIds = useMemo(() => {
    if (!uid) return []
    return [uid, ...friendIds.filter((id) => id !== uid)]
  }, [uid, friendIds.join('|')])

  const visibleKey = visibleUserIds.join('|')

  useEffect(() => {
    const repo = getTerritoryRepository()
    if (!repo || visibleUserIds.length === 0) {
      setTerritories([])
      setUsers([])
      return
    }

    const unsub = repo.subscribeTerritories({
      visibleUserIds,
      viewerUid: uid,
      onUpdate: (list) => {
        setTerritories(list)
        const derived = deriveUsersFromTerritories(list)
        const existing = useTerritoryStore.getState().users
        setUsers(mergeDerivedWithExisting(derived, existing))
      },
      onError: (err) => {
        log.error({
          scope: 'useFirestoreTerritorySync',
          event: 'territory_sync_failed',
          uid,
          message: err.message,
        })
      },
    })

    return () => {
      unsub?.()
    }
  }, [visibleKey, uid, setTerritories, setUsers])
}
