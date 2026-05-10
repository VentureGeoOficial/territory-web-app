import type { TrackPoint } from '@/lib/territory/types'
import { haversineDistance } from '@/lib/territory/geo'

/** Velocidade máxima de corrida (24 km/h) em metros por segundo */
export const MAX_RUN_SPEED_KMH = 24
const HYSTERESIS_KMH = 1

/** Média dos últimos N instantes de velocidade (m/s derivados GPS). */
export const SPEED_GATE_WINDOW_SIZE = 5

/** Actualizações consecutivas para confirmar entrada/saída de pausa. */
export const SPEED_GATE_CONSECUTIVE_SAMPLES = 3

const MIN_DT_SEC = 0.5

const MAX_SPEED_MPS = (MAX_RUN_SPEED_KMH * 1000) / 3600
const EXIT_SPEED_MPS =
  ((MAX_RUN_SPEED_KMH - HYSTERESIS_KMH) * 1000) / 3600

/** Ignorar saltos derivados de jitter GPS (m/s) antes de alimentar a média móvel */
const MAX_TELEPORT_SPEED_MPS = 45

export type SpeedPauseTransition = 'enter' | 'exit' | null

export interface SpeedGateConfig {
  maxAccuracyM: number
  windowSize?: number
  consecutiveRequired?: number
}

/**
 * Estado interno reconstruível via `snapshot` opcional futuro — hoje apenas instâncias por corrida.
 */
export class SpeedGate {
  readonly maxAccuracyM: number
  readonly windowSize: number
  readonly consecutiveRequired: number

  private readonly speeds: number[] = []
  private lastSample: TrackPoint | null = null
  paused = false
  private streakAbove = 0
  private streakBelow = 0

  constructor(config: SpeedGateConfig) {
    this.maxAccuracyM = config.maxAccuracyM
    this.windowSize = config.windowSize ?? SPEED_GATE_WINDOW_SIZE
    this.consecutiveRequired =
      config.consecutiveRequired ?? SPEED_GATE_CONSECUTIVE_SAMPLES
  }

  reset(): void {
    this.speeds.length = 0
    this.lastSample = null
    this.paused = false
    this.streakAbove = 0
    this.streakBelow = 0
  }

  /**
   * Avalia novo ponto. Retorna velocidade média atual (últimos N) ou null se ainda não há dados.
   * `skippedTeleport` verdadeiro se o movimento sugere salto irreale (não alimentou a média).
   */
  evaluate(tp: TrackPoint): {
    transition: SpeedPauseTransition
    meanMps: number | null
    skippedTeleport: boolean
  } {
    if (tp.accuracy != null && tp.accuracy > this.maxAccuracyM) {
      return {
        transition: null,
        meanMps: this.meanSpeed(),
        skippedTeleport: false,
      }
    }

    let skippedTeleport = false
    if (this.lastSample) {
      const dt = (tp.timestamp - this.lastSample.timestamp) / 1000
      if (dt >= MIN_DT_SEC) {
        const dist = haversineDistance(this.lastSample, tp)
        const inst = dist / dt
        if (inst <= MAX_TELEPORT_SPEED_MPS) {
          this.pushSpeed(inst)
          this.applyStreaks()
        } else {
          skippedTeleport = true
        }
      }
    }

    const transition = this.maybeTransition()
    this.lastSample = tp

    return {
      transition,
      meanMps: this.meanSpeed(),
      skippedTeleport,
    }
  }

  private maybeTransition(): SpeedPauseTransition {
    const mean = this.meanSpeed()
    if (mean == null) return null

    if (!this.paused) {
      if (
        this.streakAbove >= this.consecutiveRequired &&
        mean > MAX_SPEED_MPS
      ) {
        this.paused = true
        return 'enter'
      }
      return null
    }

    if (
      this.streakBelow >= this.consecutiveRequired &&
      mean < EXIT_SPEED_MPS
    ) {
      this.paused = false
      return 'exit'
    }
    return null
  }

  private applyStreaks(): void {
    const mean = this.meanSpeed()
    if (mean == null) return

    const above = mean > MAX_SPEED_MPS
    const below = mean < EXIT_SPEED_MPS
    if (above) {
      this.streakAbove++
      this.streakBelow = 0
    } else if (below) {
      this.streakBelow++
      this.streakAbove = 0
    } else {
      this.streakAbove = 0
      this.streakBelow = 0
    }
  }

  private pushSpeed(v: number): void {
    this.speeds.push(v)
    while (this.speeds.length > this.windowSize) {
      this.speeds.shift()
    }
  }

  private meanSpeed(): number | null {
    if (this.speeds.length === 0) return null
    let s = 0
    for (const x of this.speeds) s += x
    return s / this.speeds.length
  }
}
