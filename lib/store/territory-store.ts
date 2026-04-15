import { create } from 'zustand'
import { useAuthStore } from '@/lib/store/auth-store'
import type { Position } from 'geojson'
import type {
  Territory,
  User,
  MapMode,
  TerritoryFilters,
  TerritoryStatus,
} from '../territory/types'
import { generateId, generateUserColor } from '../territory/geo'
import {
  calculateTerritoryFromPositions,
  checkTerritoryIntersection,
} from '../territory/territory-generator'

interface TerritoryState {
  // Data
  territories: Territory[]
  users: User[]
  currentUserId: string

  // Map state
  mapCenter: Position
  mapZoom: number
  mapMode: MapMode
  selectedTerritoryId: string | null

  // Drawing state
  drawingPoints: Position[]
  isDrawing: boolean

  // Filters
  filters: TerritoryFilters

  // Actions - Data
  setTerritories: (territories: Territory[]) => void
  addTerritory: (territory: Territory) => void
  updateTerritory: (id: string, updates: Partial<Territory>) => void
  removeTerritory: (id: string) => void

  // Actions - Users
  setUsers: (users: User[]) => void
  setCurrentUserId: (userId: string) => void
  getCurrentUser: () => User | undefined

  // Actions - Map
  setMapCenter: (center: Position) => void
  setMapZoom: (zoom: number) => void
  setMapMode: (mode: MapMode) => void
  selectTerritory: (id: string | null) => void

  // Actions - Drawing
  startDrawing: () => void
  addDrawingPoint: (point: Position) => void
  removeLastDrawingPoint: () => void
  clearDrawing: () => void
  finishDrawing: () => Territory | null

  // Actions - Filters
  setFilters: (filters: Partial<TerritoryFilters>) => void
  clearFilters: () => void

  // Computed
  getFilteredTerritories: () => Territory[]
  getUserTerritories: (userId: string) => Territory[]
  getTerritoryById: (id: string) => Territory | undefined
  getUserById: (id: string) => User | undefined
  getDisputedTerritories: () => Territory[]
  getTotalAreaForUser: (userId: string) => number

  // Init
  initMockData: () => void
}

export const useTerritoryStore = create<TerritoryState>((set, get) => ({
  // Initial state
  territories: [],
  users: [],
  currentUserId: 'user-demo',
  mapCenter: [-46.6333, -23.5505], // Sao Paulo
  mapZoom: 14,
  mapMode: 'view',
  selectedTerritoryId: null,
  drawingPoints: [],
  isDrawing: false,
  filters: {},

  // Data actions
  setTerritories: (territories) => set({ territories }),

  addTerritory: (territory) =>
    set((state) => ({
      territories: [...state.territories, territory],
    })),

  updateTerritory: (id, updates) =>
    set((state) => ({
      territories: state.territories.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  removeTerritory: (id) =>
    set((state) => ({
      territories: state.territories.filter((t) => t.id !== id),
      selectedTerritoryId:
        state.selectedTerritoryId === id ? null : state.selectedTerritoryId,
    })),

  // User actions
  setUsers: (users) => set({ users }),
  setCurrentUserId: (userId) => set({ currentUserId: userId }),
  getCurrentUser: () => {
    const state = get()
    return state.users.find((u) => u.id === state.currentUserId)
  },

  // Map actions
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  setMapMode: (mode) =>
    set({
      mapMode: mode,
      isDrawing: mode === 'draw',
      drawingPoints: mode === 'draw' ? [] : get().drawingPoints,
    }),
  selectTerritory: (id) => set({ selectedTerritoryId: id }),

  // Drawing actions
  startDrawing: () =>
    set({
      isDrawing: true,
      drawingPoints: [],
      mapMode: 'draw',
    }),

  addDrawingPoint: (point) =>
    set((state) => ({
      drawingPoints: [...state.drawingPoints, point],
    })),

  removeLastDrawingPoint: () =>
    set((state) => ({
      drawingPoints: state.drawingPoints.slice(0, -1),
    })),

  clearDrawing: () =>
    set({
      drawingPoints: [],
      isDrawing: false,
      mapMode: 'view',
    }),

  finishDrawing: () => {
    const state = get()
    const { drawingPoints, currentUserId, territories } = state

    if (drawingPoints.length < 3) {
      return null
    }

    try {
      const calculation = calculateTerritoryFromPositions(drawingPoints)
      const currentUser = state.users.find((u) => u.id === currentUserId)
      const authName = useAuthStore.getState().user?.displayName

      // Check for disputes with existing territories
      let status: TerritoryStatus = 'active'
      for (const existingTerritory of territories) {
        if (
          checkTerritoryIntersection(calculation.polygon, existingTerritory.polygon)
        ) {
          status = 'disputed'
          // Also mark the existing territory as disputed
          set((s) => ({
            territories: s.territories.map((t) =>
              t.id === existingTerritory.id ? { ...t, status: 'disputed' } : t
            ),
          }))
        }
      }

      const newTerritory: Territory = {
        id: generateId(),
        userId: currentUserId,
        userName: currentUser?.displayName || authName || 'Corredor',
        userColor: currentUser?.color || '#B8FF00',
        polygon: calculation.polygon,
        areaM2: calculation.areaM2,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        protectedUntil: Date.now() + 3 * 60 * 60 * 1000, // 3h (regra produto MVP)
        status,
        dominanceLevel: 'bronze',
        conquestCount: 1,
        center: calculation.center,
      }

      set((s) => ({
        territories: [...s.territories, newTerritory],
        drawingPoints: [],
        isDrawing: false,
        mapMode: 'view',
      }))

      return newTerritory
    } catch (error) {
      console.error('Erro ao criar territorio:', error)
      return null
    }
  },

  // Filter actions
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  clearFilters: () => set({ filters: {} }),

  // Computed getters
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

  // Initialize mock data
  initMockData: () => {
    const mockUsers: User[] = [
      {
        id: 'user-demo',
        displayName: 'Voce',
        email: 'demo@territoryrun.app',
        color: '#B8FF00', // Performance Lime
        totalAreaM2: 0,
        territoriesCount: 0,
        totalDistanceM: 0,
        totalDurationSeconds: 0,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
      },
      {
        id: 'user-2',
        displayName: 'Carlos Runner',
        color: '#00BFFF', // Electric Blue
        totalAreaM2: 15000,
        territoriesCount: 3,
        totalDistanceM: 25000,
        totalDurationSeconds: 7200,
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        lastActiveAt: Date.now() - 2 * 60 * 60 * 1000,
      },
      {
        id: 'user-3',
        displayName: 'Ana Maratona',
        color: '#FF6B6B', // Coral
        totalAreaM2: 22000,
        territoriesCount: 4,
        totalDistanceM: 42000,
        totalDurationSeconds: 14400,
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
        lastActiveAt: Date.now() - 24 * 60 * 60 * 1000,
      },
    ]

    // Mock territories around Sao Paulo - Ibirapuera Park area
    const mockTerritories: Territory[] = [
      {
        id: 'territory-1',
        userId: 'user-2',
        userName: 'Carlos Runner',
        userColor: '#00BFFF',
        polygon: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-46.6577, -23.5874],
                [-46.6567, -23.5864],
                [-46.6547, -23.5869],
                [-46.6537, -23.5884],
                [-46.6547, -23.5899],
                [-46.6567, -23.5894],
                [-46.6577, -23.5874],
              ],
            ],
          },
        },
        areaM2: 12500,
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        status: 'active',
        dominanceLevel: 'silver',
        conquestCount: 2,
        center: [-46.6557, -23.5879],
      },
      {
        id: 'territory-2',
        userId: 'user-3',
        userName: 'Ana Maratona',
        userColor: '#FF6B6B',
        polygon: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-46.6617, -23.5834],
                [-46.6597, -23.5824],
                [-46.6577, -23.5834],
                [-46.6577, -23.5854],
                [-46.6597, -23.5864],
                [-46.6617, -23.5854],
                [-46.6617, -23.5834],
              ],
            ],
          },
        },
        areaM2: 18000,
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        status: 'active',
        dominanceLevel: 'gold',
        conquestCount: 5,
        center: [-46.6597, -23.5844],
      },
      {
        id: 'territory-3',
        userId: 'user-2',
        userName: 'Carlos Runner',
        userColor: '#00BFFF',
        polygon: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-46.6507, -23.5904],
                [-46.6487, -23.5894],
                [-46.6467, -23.5904],
                [-46.6467, -23.5924],
                [-46.6487, -23.5934],
                [-46.6507, -23.5924],
                [-46.6507, -23.5904],
              ],
            ],
          },
        },
        areaM2: 8500,
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        protectedUntil: Date.now() + 1 * 60 * 60 * 1000,
        status: 'protected',
        dominanceLevel: 'bronze',
        conquestCount: 1,
        center: [-46.6487, -23.5914],
      },
    ]

    set({
      users: mockUsers,
      territories: mockTerritories,
      currentUserId: 'user-demo',
      mapCenter: [-46.6557, -23.5870], // Ibirapuera
    })
  },
}))
