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
  /** Última posição GPS (marcador ao vivo) */
  livePosition: { lat: number; lng: number } | null
  distanceMeters: number

  setPermission: (p: GeoPermissionState) => void
  resetRunState: () => void
  startRun: () => void
  cancelRun: () => void
  appendTrackPoint: (p: TrackPoint) => void
  setLivePosition: (lat: number, lng: number) => void
}

export const useRunStore = create<RunState>((set, get) => ({
  permission: 'unknown',
  isRunning: false,
  startedAt: null,
  points: [],
  livePosition: null,
  distanceMeters: 0,

  setPermission: (p) => set({ permission: p }),

  resetRunState: () =>
    set({
      isRunning: false,
      startedAt: null,
      points: [],
      livePosition: null,
      distanceMeters: 0,
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
}))
