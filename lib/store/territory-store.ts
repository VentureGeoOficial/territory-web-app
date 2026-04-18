import { create } from 'zustand'
import type { Position } from 'geojson'
import type { Territory, User, MapMode, TerritoryFilters } from '../territory/types'
import { SUZANO_MAP_CENTER } from '../territory/regions'

interface TerritoryState {
  territories: Territory[]
  users: User[]
  currentUserId: string

  mapCenter: Position
  mapZoom: number
  mapMode: MapMode
  selectedTerritoryId: string | null

  filters: TerritoryFilters

  setTerritories: (territories: Territory[]) => void
  addTerritory: (territory: Territory) => void
  updateTerritory: (id: string, updates: Partial<Territory>) => void
  removeTerritory: (id: string) => void

  setUsers: (users: User[]) => void
  upsertUser: (user: User) => void
  setCurrentUserId: (userId: string) => void
  getCurrentUser: () => User | undefined

  setMapCenter: (center: Position) => void
  setMapZoom: (zoom: number) => void
  setMapMode: (mode: MapMode) => void
  selectTerritory: (id: string | null) => void

  setFilters: (filters: Partial<TerritoryFilters>) => void
  clearFilters: () => void

  getFilteredTerritories: () => Territory[]
  getUserTerritories: (userId: string) => Territory[]
  getTerritoryById: (id: string) => Territory | undefined
  getUserById: (id: string) => User | undefined
  getDisputedTerritories: () => Territory[]
  getTotalAreaForUser: (userId: string) => number
}

export const useTerritoryStore = create<TerritoryState>((set, get) => ({
  territories: [],
  users: [],
  currentUserId: '',
  mapCenter: SUZANO_MAP_CENTER,
  mapZoom: 14,
  mapMode: 'view',
  selectedTerritoryId: null,
  filters: {},

  setTerritories: (territories) => set({ territories }),

  addTerritory: (territory) =>
    set((state) => ({
      territories: [...state.territories, territory],
    })),

  updateTerritory: (id, updates) =>
    set((state) => ({
      territories: state.territories.map((t) =>
        t.id === id ? { ...t, ...updates } : t,
      ),
    })),

  removeTerritory: (id) =>
    set((state) => ({
      territories: state.territories.filter((t) => t.id !== id),
      selectedTerritoryId:
        state.selectedTerritoryId === id ? null : state.selectedTerritoryId,
    })),

  setUsers: (users) => set({ users }),

  upsertUser: (user) =>
    set((state) => {
      const i = state.users.findIndex((u) => u.id === user.id)
      if (i < 0) {
        return { users: [...state.users, user] }
      }
      const next = [...state.users]
      next[i] = { ...next[i]!, ...user }
      return { users: next }
    }),

  setCurrentUserId: (userId) => set({ currentUserId: userId }),

  getCurrentUser: () => {
    const state = get()
    return state.users.find((u) => u.id === state.currentUserId)
  },

  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  setMapMode: (mode) => set({ mapMode: mode }),
  selectTerritory: (id) => set({ selectedTerritoryId: id }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  clearFilters: () => set({ filters: {} }),

  getFilteredTerritories: () => {
    const { territories, filters } = get()
    return territories.filter((t) => {
      if (filters.userId && t.userId !== filters.userId) return false
      if (filters.status && !filters.status.includes(t.status)) return false
      if (filters.minAreaM2 && t.areaM2 < filters.minAreaM2) return false
      if (filters.maxAreaM2 && t.areaM2 > filters.maxAreaM2) return false
      return true
    })
  },

  getUserTerritories: (userId) => {
    return get().territories.filter((t) => t.userId === userId)
  },

  getTerritoryById: (id) => {
    return get().territories.find((t) => t.id === id)
  },

  getUserById: (id) => {
    return get().users.find((u) => u.id === id)
  },

  getDisputedTerritories: () => {
    return get().territories.filter((t) => t.status === 'disputed')
  },

  getTotalAreaForUser: (userId) => {
    return get()
      .territories.filter((t) => t.userId === userId)
      .reduce((sum, t) => sum + t.areaM2, 0)
  },
}))
