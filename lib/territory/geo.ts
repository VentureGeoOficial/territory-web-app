import type { Position } from 'geojson'
import type { TrackPoint } from './types'

/**
 * Raio da Terra em metros
 */
const EARTH_RADIUS_M = 6371000

/**
 * Converte graus para radianos
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Converte radianos para graus
 */
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

/**
 * Calcula a distancia entre dois pontos usando a formula de Haversine
 * @returns Distancia em metros
 */
export function haversineDistance(
  point1: Position | TrackPoint,
  point2: Position | TrackPoint
): number {
  const lat1 = Array.isArray(point1) ? point1[1] : point1.latitude
  const lng1 = Array.isArray(point1) ? point1[0] : point1.longitude
  const lat2 = Array.isArray(point2) ? point2[1] : point2.latitude
  const lng2 = Array.isArray(point2) ? point2[0] : point2.longitude

  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_M * c
}

/**
 * Calcula a distancia total de uma rota (array de pontos)
 * @returns Distancia total em metros
 */
export function calculateRouteDistance(points: Position[] | TrackPoint[]): number {
  if (points.length < 2) return 0

  let totalDistance = 0
  for (let i = 1; i < points.length; i++) {
    totalDistance += haversineDistance(points[i - 1], points[i])
  }

  return totalDistance
}

/**
 * Converte TrackPoint para Position [lng, lat]
 */
export function trackPointToPosition(point: TrackPoint): Position {
  return [point.longitude, point.latitude]
}

/**
 * Converte array de TrackPoints para array de Positions
 */
export function trackPointsToPositions(points: TrackPoint[]): Position[] {
  return points.map(trackPointToPosition)
}

/**
 * Calcula o centro geometrico de um array de pontos
 */
export function calculateCenter(points: Position[]): Position {
  if (points.length === 0) return [0, 0]

  let sumLng = 0
  let sumLat = 0

  for (const point of points) {
    sumLng += point[0]
    sumLat += point[1]
  }

  return [sumLng / points.length, sumLat / points.length]
}

/**
 * Calcula o bounding box de um array de pontos
 * @returns [minLng, minLat, maxLng, maxLat]
 */
export function calculateBoundingBox(
  points: Position[]
): [number, number, number, number] {
  if (points.length === 0) return [0, 0, 0, 0]

  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity

  for (const point of points) {
    minLng = Math.min(minLng, point[0])
    minLat = Math.min(minLat, point[1])
    maxLng = Math.max(maxLng, point[0])
    maxLat = Math.max(maxLat, point[1])
  }

  return [minLng, minLat, maxLng, maxLat]
}

/**
 * Verifica se um ponto esta dentro de um bounding box
 */
export function isPointInBoundingBox(
  point: Position,
  bbox: [number, number, number, number]
): boolean {
  const [minLng, minLat, maxLng, maxLat] = bbox
  return (
    point[0] >= minLng &&
    point[0] <= maxLng &&
    point[1] >= minLat &&
    point[1] <= maxLat
  )
}

/**
 * Formata area em metros quadrados para exibicao
 */
export function formatArea(areaM2: number): string {
  if (areaM2 >= 1000000) {
    return `${(areaM2 / 1000000).toFixed(2)} km²`
  }
  if (areaM2 >= 10000) {
    return `${(areaM2 / 10000).toFixed(2)} ha`
  }
  return `${Math.round(areaM2).toLocaleString('pt-BR')} m²`
}

/**
 * Formata distancia em metros para exibicao
 */
export function formatDistance(distanceM: number): string {
  if (distanceM >= 1000) {
    return `${(distanceM / 1000).toFixed(2)} km`
  }
  return `${Math.round(distanceM)} m`
}

/**
 * Formata duracao em segundos para exibicao
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  if (minutes > 0) {
    return `${minutes}min ${secs}s`
  }
  return `${secs}s`
}

const USER_COLOR_PALETTE = [
  '#00BFFF', // Electric Blue
  '#FF6B6B', // Coral
  '#9B59B6', // Purple
  '#E67E22', // Orange
  '#1ABC9C', // Teal
  '#F39C12', // Yellow
  '#3498DB', // Blue
  '#E74C3C', // Red
  '#2ECC71', // Green
  '#CCFF00', // Performance Lime
] as const

/**
 * Gera uma cor aleatoria para usuario
 */
export function generateUserColor(): string {
  return USER_COLOR_PALETTE[
    Math.floor(Math.random() * USER_COLOR_PALETTE.length)
  ]!
}

/** Cor estável por identificador (ex.: uid Firebase). */
export function generateStableUserColor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  return USER_COLOR_PALETTE[h % USER_COLOR_PALETTE.length]!
}

/**
 * Gera um ID unico
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
