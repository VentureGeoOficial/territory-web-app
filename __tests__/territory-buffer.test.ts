import { describe, expect, it } from 'vitest'
import type { TrackPoint } from '@/lib/territory/types'
import { RUN_TERRITORY_CONFIG } from '@/lib/territory/types'
import { createTerritoryFromRunTrack } from '@/lib/territory/run-territory'

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

describe('createTerritoryFromRunTrack', () => {
  it('rejeita percurso com poucos pontos', () => {
    const pts = makeTrack([[-23.55, -46.31], [-23.551, -46.311]])
    expect(() =>
      createTerritoryFromRunTrack({
        points: pts,
        currentUserId: 'u1',
        existingTerritories: [],
      }),
    ).toThrow()
  })

  it('gera polígono com área positiva para percurso em linha', () => {
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
    const { newTerritory } = createTerritoryFromRunTrack({
      points: pts,
      currentUserId: 'u1',
      existingTerritories: [],
    })
    expect(newTerritory.areaM2).toBeGreaterThan(100)
    expect(newTerritory.polygon.geometry.type).toBe('Polygon')
  })

  it('usa buffer configurável (~30 m default)', () => {
    expect(RUN_TERRITORY_CONFIG.bufferKm).toBeCloseTo(0.03, 2)
  })
})
