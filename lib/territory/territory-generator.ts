import * as turf from '@turf/turf'
import type { Feature, Polygon, Position } from 'geojson'
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

  // Verificar loop fechado
  let loopGap = 0
  if (points.length >= 2) {
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
 * Cria um territorio a partir de positions ja convertidas (para simulador)
 */
export function calculateTerritoryFromPositions(
  positions: Position[],
  bufferKm: number = 0.03
): TerritoryCalculation {
  if (positions.length < 3) {
    throw new Error('Precisa de pelo menos 3 pontos para criar um territorio')
  }

  // Fechar o loop se necessario
  const closedPositions = [...positions]
  if (
    positions[0][0] !== positions[positions.length - 1][0] ||
    positions[0][1] !== positions[positions.length - 1][1]
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

    if (!intersection || intersection.geometry.type !== 'Polygon') {
      return { intersectionPolygon: null, areaM2: 0 }
    }

    const areaM2 = turf.area(intersection)
    return { intersectionPolygon: intersection as Feature<Polygon>, areaM2 }
  } catch {
    return { intersectionPolygon: null, areaM2: 0 }
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
