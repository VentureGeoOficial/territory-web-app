import type { Unsubscribe } from 'firebase/firestore'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import {
  subscribeTerritories as subscribeTerritoriesFirebase,
  saveTerritoryAndUpdateUserStats,
} from '@/lib/firebase/territories'
import { subscribeGlobalLeaderboard } from '@/lib/firebase/ranking'
import { useTerritoryStore } from '@/lib/store/territory-store'
import type { RankingEntry, Territory } from '@/lib/territory/types'

export interface TerritoryRepository {
  subscribeTerritories(
    onUpdate: (territories: Territory[]) => void,
    onError?: (e: Error) => void
  ): Unsubscribe | null

  saveTerritoryAndUpdateUserStats(territory: Territory): Promise<void>
}

export interface LeaderboardRepository {
  subscribeGlobalLeaderboard(
    onUpdate: (entries: RankingEntry[]) => void,
    max?: number
  ): Unsubscribe | null
}

function createFirebaseTerritoryRepository(): TerritoryRepository {
  return {
    subscribeTerritories: subscribeTerritoriesFirebase,
    saveTerritoryAndUpdateUserStats,
  }
}

function createMockTerritoryRepository(): TerritoryRepository {
  return {
    subscribeTerritories(onUpdate) {
      // Usa o estado local de territórios como fonte de verdade no modo mock
      const initial = useTerritoryStore.getState().territories
      onUpdate(initial)

      const unsubscribe = useTerritoryStore.subscribe(
        (s) => s.territories,
        (territories) => {
          onUpdate(territories)
        }
      )

      return unsubscribe
    },
    async saveTerritoryAndUpdateUserStats() {
      // No modo mock, não há persistência remota nem counters oficiais.
      return
    },
  }
}

function createFirebaseLeaderboardRepository(): LeaderboardRepository {
  return {
    subscribeGlobalLeaderboard: subscribeGlobalLeaderboard,
  }
}

function createMockLeaderboardRepository(): LeaderboardRepository {
  return {
    subscribeGlobalLeaderboard(onUpdate, max = 50) {
      const buildFromStore = (): RankingEntry[] => {
        const { users } = useTerritoryStore.getState()
        const sorted = [...users].sort(
          (a, b) =>
            b.totalAreaM2 - a.totalAreaM2 ||
            b.territoriesCount - a.territoriesCount
        )
        return sorted.slice(0, max).map((u, i) => ({
          userId: u.id,
          userName: u.displayName,
          userColor: u.color,
          totalAreaM2: u.totalAreaM2,
          territoriesCount: u.territoriesCount,
          rank: i + 1,
        }))
      }

      onUpdate(buildFromStore())

      const unsubscribe = useTerritoryStore.subscribe(
        (s) => ({ users: s.users, territories: s.territories }),
        () => {
          onUpdate(buildFromStore())
        }
      )

      return unsubscribe
    },
  }
}

export function getTerritoryRepository(): TerritoryRepository {
  return isFirebaseConfigured()
    ? createFirebaseTerritoryRepository()
    : createMockTerritoryRepository()
}

export function getLeaderboardRepository(): LeaderboardRepository {
  return isFirebaseConfigured()
    ? createFirebaseLeaderboardRepository()
    : createMockLeaderboardRepository()
}

