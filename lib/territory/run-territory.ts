import * as turf from '@turf/turf'
import type { Feature, Polygon } from 'geojson'
import type { Position } from 'geojson'
import type {
  Territory,
  TerritoryStatus,
  TrackPoint,
  User,
} from './types'
import { RUN_TERRITORY_CONFIG, type TerritoryConfig } from './types'
import {
  trackPointsToPositions,
  generateId,
  calculateRouteDistance,
} from './geo'
import { checkTerritoryIntersection } from './territory-generator'
import {
  SUZANO_BOUNDING_BOX,
  fractionOfPointsInsideBox,
  isPositionInsideBox,
} from './regions'

/** Tolerância Douglas–Peucker em graus (~2–3 m em Suzano). */
export const RUN_LINE_SIMPLIFY_TOLERANCE = 0.000025

export interface RunTrackValidation {
  isValid: boolean
  errors: string[]
  stats: {
    pointCount: number
    distanceMeters: number
    durationSeconds: number
  }
}

export function validateRunTrack(
  points: TrackPoint[],
  config: TerritoryConfig = RUN_TERRITORY_CONFIG,
): RunTrackValidation {
  const errors: string[] = []
  if (points.length < config.minPoints) {
    errors.push(
      `São necessários pelo menos ${config.minPoints} pontos GPS (tem ${points.length}).`,
    )
  }

  const positions = trackPointsToPositions(points)
  const distanceMeters = calculateRouteDistance(positions)
  const durationSeconds =
    points.length >= 2
      ? (points[points.length - 1]!.timestamp - points[0]!.timestamp) / 1000
      : 0

  if (distanceMeters < config.minRunDistanceMeters) {
    errors.push(
      `Percorra pelo menos ${config.minRunDistanceMeters} m (atual: ${Math.round(distanceMeters)} m).`,
    )
  }

  if (durationSeconds < config.minDurationSeconds) {
    errors.push(
      `A corrida deve durar pelo menos ${Math.ceil(config.minDurationSeconds / 60)} min.`,
    )
  }

  const inBox = fractionOfPointsInsideBox(positions, SUZANO_BOUNDING_BOX)
  if (inBox < config.minFractionInRegion) {
    errors.push(
      'A maior parte do percurso precisa estar dentro da área de Suzano.',
    )
  }

  return {
    isValid: errors.length === 0,
    errors,
    stats: {
      pointCount: points.length,
      distanceMeters,
      durationSeconds,
    },
  }
}

function bufferLineToPolygon(
  positions: Position[],
  bufferKm: number,
): Feature<Polygon> {
  if (positions.length < 2) {
    throw new Error('Linha insuficiente para buffer')
  }

  const line = turf.lineString(positions)
  const simplified = turf.simplify(line, {
    tolerance: RUN_LINE_SIMPLIFY_TOLERANCE,
    highQuality: true,
  })

  const buffered = turf.buffer(simplified, bufferKm, { units: 'kilometers' })
  if (!buffered) {
    throw new Error('Falha ao calcular buffer do percurso')
  }

  if (buffered.geometry.type === 'Polygon') {
    return buffered as Feature<Polygon>
  }

  if (buffered.geometry.type === 'MultiPolygon') {
    let best: Feature<Polygon> | null = null
    let bestArea = 0
    for (const rings of buffered.geometry.coordinates) {
      const poly = turf.polygon(rings)
      const a = turf.area(poly)
      if (a > bestArea) {
        bestArea = a
        best = poly as Feature<Polygon>
      }
    }
    if (!best) throw new Error('Buffer vazio')
    return best
  }

  throw new Error('Geometria de buffer inesperada')
}

export interface CreateTerritoryFromRunParams {
  points: TrackPoint[]
  currentUserId: string
  currentUser?: User
  authDisplayName?: string | null
  existingTerritories: Territory[]
  config?: TerritoryConfig
  nowMs?: number
}

export interface CreateTerritoryFromRunResult {
  territories: Territory[]
  newTerritory: Territory
}

/**
 * Gera polígono de domínio: simplificação DP na linha → buffer 20 m (apenas ao finalizar).
 */
export function createTerritoryFromRunTrack(
  params: CreateTerritoryFromRunParams,
): CreateTerritoryFromRunResult {
  const {
    points,
    currentUserId,
    currentUser,
    authDisplayName,
    existingTerritories,
    config: cfgIn,
    nowMs,
  } = params

  const config = cfgIn ?? RUN_TERRITORY_CONFIG
  const validation = validateRunTrack(points, config)
  if (!validation.isValid) {
    throw new Error(validation.errors.join(' '))
  }

  const positions = trackPointsToPositions(points)
  const polygon = bufferLineToPolygon(positions, config.bufferKm)
  const areaM2 = turf.area(polygon)
  const centroid = turf.centroid(polygon)
  const center = centroid.geometry.coordinates as Position

  if (!isPositionInsideBox(center, SUZANO_BOUNDING_BOX)) {
    throw new Error('Território fora da área permitida (Suzano).')
  }

  const now = nowMs ?? Date.now()
  let status: TerritoryStatus = 'active'

  const updatedTerritories = existingTerritories.map((existing) => {
    if (checkTerritoryIntersection(polygon, existing.polygon)) {
      status = 'disputed'
      return {
        ...existing,
        status: 'disputed' as TerritoryStatus,
      }
    }
    return existing
  })

  const displayName =
    currentUser?.displayName || authDisplayName || 'Corredor'
  const userColor = currentUser?.color ?? '#CCFF00'

  const newTerritory: Territory = {
    id: generateId(),
    userId: currentUserId,
    userName: displayName,
    userColor,
    polygon,
    areaM2,
    createdAt: now,
    updatedAt: now,
    protectedUntil: now + config.protectionTimeMs,
    status,
    dominanceLevel: 'bronze',
    conquestCount: 1,
    center,
  }

  return {
    territories: [...updatedTerritories, newTerritory],
    newTerritory,
  }
}
