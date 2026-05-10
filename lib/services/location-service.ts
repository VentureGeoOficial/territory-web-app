/**
 * Geolocalização no browser: permissão e rastreamento com throttling.
 */

import type { TrackPoint } from '@/lib/territory/types'
import { haversineDistance } from '@/lib/territory/geo'
import type { SpeedGate } from '@/lib/services/speed-gate'

/** Rejeitar emissão de ponto de percurso acima disto (m/s) — salto GPS */
const MAX_EMIT_INSTANT_SPEED_MPS = 45

const DEFAULT_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 5000,
  timeout: 20000,
}

export async function probeGeolocationPermission(): Promise<
  'granted' | 'denied' | 'prompt' | 'unsupported'
> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return 'unsupported'
  }
  try {
    const perm = await navigator.permissions.query({
      name: 'geolocation',
    } as PermissionDescriptor)
    if (perm.state === 'granted') return 'granted'
    if (perm.state === 'denied') return 'denied'
    return 'prompt'
  } catch {
    return 'prompt'
  }
}

export function getCurrentPositionOnce(
  options: PositionOptions = DEFAULT_OPTIONS,
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}

export interface WatchTrackOptions {
  minIntervalMs: number
  minDistanceM: number
  maxAccuracyM: number
  maxSpeedMps: number
  onPoint: (p: TrackPoint) => void
  onError?: (code: number) => void
}

/**
 * watchPosition com filtro de intervalo, distância, precisão e velocidade (anti-trapaça leve).
 * Retorna id do watch (para clearWatch).
 */
export interface WatchRunTrackOptions {
  minIntervalMs: number
  minDistanceM: number
  maxAccuracyM: number
  gate: SpeedGate
  onPoint: (p: TrackPoint) => void
  /** Marca vivo no mapa: durante pausa só é chamado com throttle */
  onLivePosition: (lat: number, lng: number) => void
  onSpeedPauseChange?: (paused: boolean) => void
  onError?: (code: number) => void
}

/** Mínimo entre actualizações do marcador enquanto `isPausedDueToSpeed` */
const PAUSED_LIVE_MIN_MS = 4000

/**
 * Rastreio durante corrida: média móvel de velocidade ({@link SpeedGate}) com histerese;
 * quando pausado, não regista pontos nem distância — apenas posição ao vivo espaçada.
 */
export function watchRunTrack(opts: WatchRunTrackOptions): number {
  const {
    minIntervalMs,
    minDistanceM,
    maxAccuracyM,
    gate,
    onPoint,
    onLivePosition,
    onSpeedPauseChange,
    onError,
  } = opts

  let lastEmit = 0
  let lastTrackPoint: TrackPoint | null = null
  let lastLiveUpdate = 0

  const id = navigator.geolocation.watchPosition(
    (pos) => {
      const now = Date.now()
      const { latitude, longitude, accuracy, altitude, speed } = pos.coords
      if (accuracy != null && accuracy > maxAccuracyM) return

      const tp: TrackPoint = {
        latitude,
        longitude,
        timestamp: now,
        accuracy: accuracy ?? undefined,
        altitude: altitude ?? undefined,
        speed: speed ?? undefined,
      }

      const { transition } = gate.evaluate(tp)
      if (transition === 'enter' || transition === 'exit') {
        const ts = new Date().toISOString()
        console.info(`[${ts}] [INFO] [SpeedGate]`, {
          functionality: 'watchRunTrack',
          source: 'lib/services/location-service.ts',
          transition,
          paused: gate.paused,
        })
        if (transition === 'enter') onSpeedPauseChange?.(true)
        else onSpeedPauseChange?.(false)
      }

      if (gate.paused) {
        if (now - lastLiveUpdate >= PAUSED_LIVE_MIN_MS) {
          lastLiveUpdate = now
          onLivePosition(latitude, longitude)
        }
        return
      }

      if (now - lastEmit < minIntervalMs && lastTrackPoint) return

      if (lastTrackPoint) {
        const dt = (tp.timestamp - lastTrackPoint.timestamp) / 1000
        const dist = haversineDistance(lastTrackPoint, tp)
        if (dt > 0.5 && dist / dt > MAX_EMIT_INSTANT_SPEED_MPS) return
        if (dist < minDistanceM && now - lastEmit < minIntervalMs * 2)
          return
      }

      lastEmit = now
      lastTrackPoint = tp
      onPoint(tp)
      onLivePosition(latitude, longitude)
      lastLiveUpdate = now
    },
    (err) => {
      onError?.(err.code)
    },
    DEFAULT_OPTIONS,
  )

  return id
}

export function watchFilteredTrack(
  opts: WatchTrackOptions,
): number {
  const {
    minIntervalMs,
    minDistanceM,
    maxAccuracyM,
    maxSpeedMps,
    onPoint,
    onError,
  } = opts

  let lastEmit = 0
  let lastAccepted: TrackPoint | null = null

  const id = navigator.geolocation.watchPosition(
    (pos) => {
      const now = Date.now()
      const { latitude, longitude, accuracy, altitude, speed } = pos.coords
      if (accuracy != null && accuracy > maxAccuracyM) return

      const tp: TrackPoint = {
        latitude,
        longitude,
        timestamp: now,
        accuracy: accuracy ?? undefined,
        altitude: altitude ?? undefined,
        speed: speed ?? undefined,
      }

      if (now - lastEmit < minIntervalMs && lastAccepted) return

      if (lastAccepted) {
        const dt = (tp.timestamp - lastAccepted.timestamp) / 1000
        const dist = haversineDistance(lastAccepted, tp)
        if (dt > 0.5 && dist / dt > maxSpeedMps) return
        if (dist < minDistanceM && now - lastEmit < minIntervalMs * 2) return
      }

      lastEmit = now
      lastAccepted = tp
      onPoint(tp)
    },
    (err) => {
      onError?.(err.code)
    },
    DEFAULT_OPTIONS,
  )

  return id
}

export function clearWatch(watchId: number): void {
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId)
  }
}
