import { create } from 'zustand'
import type { TrackPoint } from '@/lib/territory/types'
import { haversineDistance } from '@/lib/territory/geo'

export type GeoPermissionState =
  | 'unknown'
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'unsupported'

interface RunState {
  permission: GeoPermissionState
  isRunning: boolean
  startedAt: number | null
  points: TrackPoint[]
  /** Última posição GPS (marcador ao vivo durante corrida) */
  livePosition: { lat: number; lng: number } | null
  /** Posição atual do usuário (sempre visível, independente de corrida) */
  currentUserPosition: { lat: number; lng: number } | null
  /** Se está rastreando a posição do usuário */
  isTrackingPosition: boolean
  distanceMeters: number

  setPermission: (p: GeoPermissionState) => void
  resetRunState: () => void
  startRun: () => void
  cancelRun: () => void
  appendTrackPoint: (p: TrackPoint) => void
  setLivePosition: (lat: number, lng: number) => void
  setCurrentUserPosition: (lat: number, lng: number) => void
  setIsTrackingPosition: (isTracking: boolean) => void
}

export const useRunStore = create<RunState>((set, get) => ({
  permission: 'unknown',
  isRunning: false,
  startedAt: null,
  points: [],
  livePosition: null,
  currentUserPosition: null,
  isTrackingPosition: false,
  distanceMeters: 0,

  setPermission: (p) => set({ permission: p }),

  resetRunState: () =>
    set({
      isRunning: false,
      startedAt: null,
      points: [],
      livePosition: null,
      distanceMeters: 0,
      // Mantém currentUserPosition e isTrackingPosition
    }),

  startRun: () =>
    set({
      isRunning: true,
      startedAt: Date.now(),
      points: [],
      livePosition: null,
      distanceMeters: 0,
    }),

  cancelRun: () => get().resetRunState(),

  appendTrackPoint: (p) =>
    set((state) => {
      const prev = state.points[state.points.length - 1]
      let extra = 0
      if (prev) {
        extra = haversineDistance(prev, p)
      }
      return {
        points: [...state.points, p],
        distanceMeters: state.distanceMeters + extra,
      }
    }),

  setLivePosition: (lat, lng) => set({ livePosition: { lat, lng } }),

  setCurrentUserPosition: (lat, lng) => set({ currentUserPosition: { lat, lng } }),

  setIsTrackingPosition: (isTracking) => set({ isTrackingPosition: isTracking }),
}))
