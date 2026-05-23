import * as turf from '@turf/turf'
import type { Feature, MultiPolygon, Polygon, Position } from 'geojson'
import type {
  TrackPoint,
  TerritoryConfig,
  TerritoryCalculation,
  RouteValidation,
} from './types'
import {
  haversineDistance,
  trackPointsToPositions,
} from './geo'

/**
 * Valida uma rota para criacao de territorio
 */
export function validateRoute(
  points: TrackPoint[],
  config: TerritoryConfig
): RouteValidation {
  const errors: string[] = []
  const warnings: string[] = []

  // Verificar numero minimo de pontos
  if (points.length < config.minPoints) {
    errors.push(
      `Rota precisa de pelo menos ${config.minPoints} pontos (atual: ${points.length})`
    )
  }

  // Calcular distancia total
  let totalDistance = 0
  for (let i = 1; i < points.length; i++) {
    totalDistance += haversineDistance(points[i - 1], points[i])
  }

  // Calcular duracao
  const duration =
    points.length >= 2
      ? (points[points.length - 1].timestamp - points[0].timestamp) / 1000
      : 0

  // Verificar duracao minima
  if (duration < config.minDurationSeconds) {
    errors.push(
      `Atividade precisa durar pelo menos ${Math.ceil(config.minDurationSeconds / 60)} minutos`
    )
  }

  // Verificar loop fechado (apenas quando maxLoopGapMeters > 0)
  let loopGap = 0
  if (config.maxLoopGapMeters > 0 && points.length >= 2) {
    loopGap = haversineDistance(points[0], points[points.length - 1])
    if (loopGap > config.maxLoopGapMeters) {
      errors.push(
        `Rota precisa formar um loop fechado (gap atual: ${Math.round(loopGap)}m, maximo: ${config.maxLoopGapMeters}m)`
      )
    }
  }

  // Calcular area estimada se a rota for valida
  let estimatedAreaM2: number | undefined
  if (errors.length === 0 && points.length >= 3) {
    try {
      const calculation = calculateTerritoryFromPoints(points, config.bufferKm)
      estimatedAreaM2 = calculation.areaM2
    } catch {
      warnings.push('Nao foi possivel calcular a area estimada')
    }
  }

  // Avisos adicionais
  if (points.length < 50 && points.length >= config.minPoints) {
    warnings.push('Rota com poucos pontos pode resultar em territorio irregular')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      pointCount: points.length,
      distanceMeters: totalDistance,
      durationSeconds: duration,
      loopGapMeters: loopGap,
      estimatedAreaM2,
    },
  }
}

/**
 * Cria um territorio a partir de pontos GPS
 */
export function calculateTerritoryFromPoints(
  points: TrackPoint[],
  bufferKm: number = 0.03
): TerritoryCalculation {
  // Converter para positions [lng, lat]
  const positions = trackPointsToPositions(points)

  // Fechar o loop se necessario
  const closedPositions = [...positions]
  if (
    positions.length > 0 &&
    (positions[0][0] !== positions[positions.length - 1][0] ||
      positions[0][1] !== positions[positions.length - 1][1])
  ) {
    closedPositions.push(positions[0])
  }

  // Criar LineString
  const line = turf.lineString(closedPositions)

  // Criar buffer ao redor da linha
  const buffered = turf.buffer(line, bufferKm, { units: 'kilometers' })

  if (!buffered || buffered.geometry.type !== 'Polygon') {
    throw new Error('Falha ao criar buffer do territorio')
  }

  // Calcular area
  const areaM2 = turf.area(buffered)

  // Calcular centro
  const centroid = turf.centroid(buffered)
  const center: Position = centroid.geometry.coordinates

  // Calcular bounding box
  const bbox = turf.bbox(buffered)

  return {
    polygon: buffered as Feature<Polygon>,
    areaM2,
    center,
    boundingBox: [bbox[0], bbox[1], bbox[2], bbox[3]],
  }
}

/**
 * Verifica se dois territorios se intersectam
 */
export function checkTerritoryIntersection(
  territory1: Feature<Polygon>,
  territory2: Feature<Polygon>
): boolean {
  return turf.booleanIntersects(territory1, territory2)
}

/**
 * Calcula a area de intersecao entre dois territorios
 */
export function calculateIntersectionArea(
  territory1: Feature<Polygon>,
  territory2: Feature<Polygon>
): { intersectionPolygon: Feature<Polygon> | null; areaM2: number } {
  try {
    const intersection = turf.intersect(
      turf.featureCollection([territory1, territory2])
    )

    if (!intersection) {
      return { intersectionPolygon: null, areaM2: 0 }
    }

    if (intersection.geometry.type === 'Polygon') {
      const areaM2 = turf.area(intersection)
      return {
        intersectionPolygon: intersection as Feature<Polygon>,
        areaM2,
      }
    }

    if (intersection.geometry.type === 'MultiPolygon') {
      let areaM2 = 0
      for (const rings of intersection.geometry.coordinates) {
        areaM2 += turf.area(turf.polygon(rings))
      }
      return { intersectionPolygon: null, areaM2 }
    }

    return { intersectionPolygon: null, areaM2: 0 }
  } catch {
    return { intersectionPolygon: null, areaM2: 0 }
  }
}

/** Área mínima (m²) para manter território da vítima após invasão parcial. */
export const MIN_REMAINDER_AREA_M2 = 50

export interface SubtractPolygonOverlapResult {
  remainder: Feature<Polygon> | null
  remainderAreaM2: number
  lostAreaM2: number
  intersectionAreaM2: number
  fullCapture: boolean
}

function largestPolygonFromGeometries(
  geometry: Polygon | MultiPolygon | null | undefined,
): Feature<Polygon> | null {
  if (!geometry) return null
  if (geometry.type === 'Polygon') {
    return turf.polygon(geometry.coordinates) as Feature<Polygon>
  }
  let best: Feature<Polygon> | null = null
  let bestArea = 0
  for (const rings of geometry.coordinates) {
    const poly = turf.polygon(rings) as Feature<Polygon>
    const a = turf.area(poly)
    if (a > bestArea) {
      bestArea = a
      best = poly
    }
  }
  return best
}

/**
 * Subtrai a área do atacante do polígono da vítima (invasão parcial).
 * Se o restante for menor que MIN_REMAINDER_AREA_M2, indica conquista total.
 */
export function subtractPolygonOverlap(
  victim: Feature<Polygon>,
  attacker: Feature<Polygon>,
): SubtractPolygonOverlapResult {
  const { areaM2: intersectionAreaM2 } = calculateIntersectionArea(victim, attacker)

  if (intersectionAreaM2 <= 0) {
    const remainderAreaM2 = turf.area(victim)
    return {
      remainder: victim,
      remainderAreaM2,
      lostAreaM2: 0,
      intersectionAreaM2: 0,
      fullCapture: false,
    }
  }

  try {
    const diffFeature = turf.difference(
      turf.featureCollection([victim, attacker]),
    ) as Feature<Polygon | MultiPolygon> | null

    const remainder = largestPolygonFromGeometries(diffFeature?.geometry ?? null)
    const remainderAreaM2 = remainder ? turf.area(remainder) : 0
    const lostAreaM2 = Math.min(intersectionAreaM2, turf.area(victim))
    const fullCapture =
      !remainder || remainderAreaM2 < MIN_REMAINDER_AREA_M2

    return {
      remainder: fullCapture ? null : remainder,
      remainderAreaM2,
      lostAreaM2,
      intersectionAreaM2,
      fullCapture,
    }
  } catch {
    return {
      remainder: null,
      remainderAreaM2: 0,
      lostAreaM2: intersectionAreaM2,
      intersectionAreaM2,
      fullCapture: true,
    }
  }
}

/**
 * Simplifica um poligono para melhor performance de renderizacao
 */
export function simplifyPolygon(
  polygon: Feature<Polygon>,
  tolerance: number = 0.00001
): Feature<Polygon> {
  return turf.simplify(polygon, { tolerance }) as Feature<Polygon>
}
