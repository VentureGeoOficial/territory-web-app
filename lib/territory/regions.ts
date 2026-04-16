import type { Position } from 'geojson'

/**
 * Bounding box aproximado de Suzano - SP.
 * [minLng, minLat, maxLng, maxLat]
 */
export const SUZANO_BOUNDING_BOX: [number, number, number, number] = [
  -46.3600, // minLng
  -23.7000, // minLat
  -46.2600, // maxLng
  -23.4800, // maxLat
]

export function isPositionInsideBox(
  position: Position,
  [minLng, minLat, maxLng, maxLat]: [number, number, number, number],
): boolean {
  const [lng, lat] = position
  return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat
}

