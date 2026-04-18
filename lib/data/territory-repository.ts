import type { Unsubscribe } from 'firebase/firestore'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import {
  subscribeTerritories as subscribeTerritoriesFirebase,
} from '@/lib/firebase/territories'
import { subscribeGlobalLeaderboard } from '@/lib/firebase/ranking'
import type { RankingEntry, Territory } from '@/lib/territory/types'

export interface TerritoryRepository {
  subscribeTerritories(
    onUpdate: (territories: Territory[]) => void,
    onError?: (e: Error) => void,
  ): Unsubscribe | null
}

export interface LeaderboardRepository {
  subscribeGlobalLeaderboard(
    onUpdate: (entries: RankingEntry[]) => void,
    max?: number,
  ): Unsubscribe | null
}

function createFirebaseTerritoryRepository(): TerritoryRepository {
  return {
    subscribeTerritories: subscribeTerritoriesFirebase,
  }
}

function createFirebaseLeaderboardRepository(): LeaderboardRepository {
  return {
    subscribeGlobalLeaderboard: subscribeGlobalLeaderboard,
  }
}

export function getTerritoryRepository(): TerritoryRepository | null {
  return isFirebaseConfigured() ? createFirebaseTerritoryRepository() : null
}

export function getLeaderboardRepository(): LeaderboardRepository | null {
  return isFirebaseConfigured() ? createFirebaseLeaderboardRepository() : null
}
