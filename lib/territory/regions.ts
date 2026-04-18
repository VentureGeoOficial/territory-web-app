import type { Position } from 'geojson'

/**
 * Bounding box aproximado de Suzano - SP.
 * [minLng, minLat, maxLng, maxLat]
 */
export const SUZANO_BOUNDING_BOX: [number, number, number, number] = [
  -46.36, // minLng
  -23.7, // minLat
  -46.26, // maxLng
  -23.48, // maxLat
]

const [minLng, minLat, maxLng, maxLat] = SUZANO_BOUNDING_BOX

/** Centro [lng, lat] para zoom inicial do mapa */
export const SUZANO_MAP_CENTER: Position = [
  (minLng + maxLng) / 2,
  (minLat + maxLat) / 2,
]

/**
 * Margem em graus para maxBounds Leaflet [[southWest],[northEast]] em [lat,lng].
 */
export function getSuzanoMaxBounds(
  padDeg = 0.001,
): [[number, number], [number, number]] {
  return [
    [minLat - padDeg, minLng - padDeg],
    [maxLat + padDeg, maxLng + padDeg],
  ]
}

export function isPositionInsideBox(
  position: Position,
  [boxMinLng, boxMinLat, boxMaxLng, boxMaxLat]: [number, number, number, number],
): boolean {
  const [lng, lat] = position
  return lng >= boxMinLng && lng <= boxMaxLng && lat >= boxMinLat && lat <= boxMaxLat
}

/** Fração de pontos [lng,lat] dentro da caixa (0–1). */
export function fractionOfPointsInsideBox(
  positions: Position[],
  box: [number, number, number, number] = SUZANO_BOUNDING_BOX,
): number {
  if (positions.length === 0) return 0
  let inside = 0
  for (const p of positions) {
    if (isPositionInsideBox(p, box)) inside++
  }
  return inside / positions.length
}

