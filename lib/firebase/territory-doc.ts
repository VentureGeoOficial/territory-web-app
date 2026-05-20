import type { Feature, Polygon } from 'geojson'
import type { Position } from 'geojson'
import type { DominanceLevel, Territory, TerritoryStatus } from '@/lib/territory/types'
import { encodeGeohash } from '@/lib/territory/geohash'

/** Forma persistida em `territories/{id}` (sem dependência do SDK cliente). */
export interface TerritoryFirestoreDoc {
  userId: string
  userName: string
  userColor: string
  polygonJson: string
  areaM2: number
  createdAt: number
  updatedAt: number
  protectedUntil?: number
  status: TerritoryStatus
  dominanceLevel: DominanceLevel
  conquestCount: number
  centerLng: number
  centerLat: number
  geohash?: string
  geohashPrefix?: string
}

export function geohashFieldsFromCenter(
  centerLat: number,
  centerLng: number,
): { geohash: string; geohashPrefix: string } {
  const geohash = encodeGeohash(centerLat, centerLng, 7)
  return { geohash, geohashPrefix: geohash.slice(0, 5) }
}

export function territoryToFirestoreDoc(t: Territory): TerritoryFirestoreDoc {
  const [lng, lat] = t.center
  const { geohash, geohashPrefix } = geohashFieldsFromCenter(lat, lng)
  return {
    userId: t.userId,
    userName: t.userName ?? 'Corredor',
    userColor: t.userColor ?? '#CCFF00',
    polygonJson: JSON.stringify(t.polygon),
    areaM2: t.areaM2,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    protectedUntil: t.protectedUntil,
    status: t.status,
    dominanceLevel: t.dominanceLevel,
    conquestCount: t.conquestCount,
    centerLng: lng,
    centerLat: lat,
    geohash,
    geohashPrefix,
  }
}

export function firestoreDocToTerritory(
  id: string,
  data: TerritoryFirestoreDoc,
): Territory {
  const polygon = JSON.parse(data.polygonJson) as Feature<Polygon>
  const center: Position = [data.centerLng, data.centerLat]
  return {
    id,
    userId: data.userId,
    userName: data.userName,
    userColor: data.userColor,
    polygon,
    areaM2: data.areaM2,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    protectedUntil: data.protectedUntil,
    status: data.status,
    dominanceLevel: data.dominanceLevel,
    conquestCount: data.conquestCount,
    center,
  }
}
