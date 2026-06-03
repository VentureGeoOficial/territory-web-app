import { describe, expect, it } from 'vitest'
import * as turf from '@turf/turf'
import type { Feature, Polygon } from 'geojson'
import type { TrackPoint } from '@/lib/territory/types'
import { createTerritoryFromRunTrack } from '@/lib/territory/run-territory'
import type { Territory } from '@/lib/territory/types'

function makeTrack(
  coords: Array<[number, number]>,
  startMs = Date.now() - 120_000,
): TrackPoint[] {
  const step = 15_000
  return coords.map(([latitude, longitude], i) => ({
    latitude,
    longitude,
    timestamp: startMs + i * step,
  }))
}

function squarePolygon(
  minLng: number,
  minLat: number,
  sizeDeg: number,
): Feature<Polygon> {
  return turf.bboxPolygon([
    minLng,
    minLat,
    minLng + sizeDeg,
    minLat + sizeDeg,
  ]) as Feature<Polygon>
}

function makeTerritory(
  id: string,
  userId: string,
  poly: Feature<Polygon>,
): Territory {
  const center = turf.centroid(poly).geometry.coordinates
  return {
    id,
    userId,
    polygon: poly,
    areaM2: turf.area(poly),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: 'active',
    dominanceLevel: 'bronze',
    conquestCount: 1,
    center: center as [number, number],
  }
}

describe('createTerritoryFromRunTrack social layer', () => {
  const pts = makeTrack([
    [-23.55, -46.31],
    [-23.551, -46.31],
    [-23.552, -46.31],
    [-23.553, -46.31],
    [-23.554, -46.31],
    [-23.555, -46.31],
    [-23.556, -46.31],
    [-23.557, -46.31],
  ])

  it('C3: overlap com território próprio não marca disputed', () => {
    const userId = 'user-a'
    const ownPoly = squarePolygon(-46.31, -23.55, 0.02)
    const existing = [makeTerritory('t1', userId, ownPoly)]
    const { newTerritory } = createTerritoryFromRunTrack({
      points: pts,
      currentUserId: userId,
      existingTerritories: existing,
      friendOwnerIds: new Set(['friend-1']),
    })
    expect(newTerritory.status).toBe('protected')
  })

  it('disputed só quando intersecta amigo', () => {
    const userId = 'user-a'
    const friendPoly = squarePolygon(-46.31, -23.55, 0.02)
    const strangerPoly = squarePolygon(-46.29, -23.54, 0.02)
    const existing = [
      makeTerritory('stranger', 'user-c', strangerPoly),
      makeTerritory('friend', 'friend-1', friendPoly),
    ]
    const { newTerritory } = createTerritoryFromRunTrack({
      points: pts,
      currentUserId: userId,
      existingTerritories: existing,
      friendOwnerIds: new Set(['friend-1']),
    })
    expect(newTerritory.status).toBe('disputed')
  })

  it('estranho overlapping não marca disputed', () => {
    const userId = 'user-a'
    const strangerPoly = squarePolygon(-46.31, -23.55, 0.02)
    const existing = [makeTerritory('stranger', 'user-c', strangerPoly)]
    const { newTerritory } = createTerritoryFromRunTrack({
      points: pts,
      currentUserId: userId,
      existingTerritories: existing,
      friendOwnerIds: new Set(['friend-1']),
    })
    expect(newTerritory.status).toBe('protected')
  })
})
