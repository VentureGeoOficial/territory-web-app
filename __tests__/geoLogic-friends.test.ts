import { describe, expect, it } from 'vitest'
import * as turf from '@turf/turf'
import type { Feature, Polygon } from 'geojson'

import {
  calculateCaptureImpact,
  hasFriendCaptureOverlap,
  isSocialEnemy,
} from '@/lib/territory/geoLogic'
import type { Territory } from '@/lib/territory/types'

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

describe('geoLogic friend social layer', () => {
  const attackerId = 'user-a'
  const friendId = 'user-b'
  const strangerId = 'user-c'
  const friendOwnerIds = new Set([friendId])

  const attackerPoly = squarePolygon(-46.31, -23.55, 0.01)
  const friendPoly = squarePolygon(-46.305, -23.55, 0.008)
  const strangerPoly = squarePolygon(-46.304, -23.55, 0.008)

  it('isSocialEnemy: amigo é inimigo social', () => {
    const t = makeTerritory('t1', friendId, friendPoly)
    expect(isSocialEnemy(t, attackerId, friendOwnerIds)).toBe(true)
  })

  it('isSocialEnemy: estranho não é inimigo social', () => {
    const t = makeTerritory('t2', strangerId, strangerPoly)
    expect(isSocialEnemy(t, attackerId, friendOwnerIds)).toBe(false)
  })

  it('isSocialEnemy: self não é inimigo social', () => {
    const t = makeTerritory('t3', attackerId, attackerPoly)
    expect(isSocialEnemy(t, attackerId, friendOwnerIds)).toBe(false)
  })

  it('C1: amigo invade amigo — impacto calculado', () => {
    const territories = [makeTerritory('tf', friendId, friendPoly)]
    const impact = calculateCaptureImpact(
      attackerPoly,
      territories,
      attackerId,
      friendOwnerIds,
    )
    expect(impact.ok).toBe(true)
    if (impact.ok) {
      expect(impact.overlappedTerritoryIds).toContain('tf')
      expect(impact.totalOverlappingAreaM2).toBeGreaterThan(0)
    }
  })

  it('C2: overlap com estranho ignorado — sem captura', () => {
    const territories = [makeTerritory('ts', strangerId, strangerPoly)]
    expect(
      hasFriendCaptureOverlap(
        attackerPoly,
        territories,
        attackerId,
        friendOwnerIds,
      ),
    ).toBe(false)
    const impact = calculateCaptureImpact(
      attackerPoly,
      territories,
      attackerId,
      friendOwnerIds,
    )
    expect(impact.ok).toBe(true)
    if (impact.ok) {
      expect(impact.overlappedTerritoryIds).toHaveLength(0)
    }
  })

  it('C6: estranhos coexistem — overlap geométrico não bloqueia', () => {
    const territories = [makeTerritory('tc', strangerId, strangerPoly)]
    const overlap = hasFriendCaptureOverlap(
      attackerPoly,
      territories,
      attackerId,
      new Set<string>(),
    )
    expect(overlap).toBe(false)
  })

  it('C7: overlap misto — só amigo conta', () => {
    const territories = [
      makeTerritory('tf', friendId, friendPoly),
      makeTerritory('ts', strangerId, strangerPoly),
    ]
    const impact = calculateCaptureImpact(
      attackerPoly,
      territories,
      attackerId,
      friendOwnerIds,
    )
    expect(impact.ok).toBe(true)
    if (impact.ok) {
      expect(impact.overlappedTerritoryIds).toEqual(['tf'])
    }
  })
})

describe('geoLogic same-owner', () => {
  it('C3: território próprio ignorado no overlap', () => {
    const selfId = 'user-a'
    const selfPoly = squarePolygon(-46.31, -23.55, 0.01)
    const newPoly = squarePolygon(-46.309, -23.55, 0.008)
    const territories = [makeTerritory('own', selfId, selfPoly)]
    expect(
      hasFriendCaptureOverlap(newPoly, territories, selfId, new Set(['f1'])),
    ).toBe(false)
  })
})
