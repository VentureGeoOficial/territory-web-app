import { describe, expect, it } from 'vitest'
import * as turf from '@turf/turf'
import type { Feature, Polygon } from 'geojson'

import {
  MIN_REMAINDER_AREA_M2,
  subtractPolygonOverlap,
} from '@/lib/territory/territory-generator'

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

describe('subtractPolygonOverlap', () => {
  it('invasão pequena: restante significativo e área perdida menor que o total', () => {
    const victim = squarePolygon(-46.31, -23.55, 0.01)
    const attacker = squarePolygon(-46.305, -23.55, 0.004)

    const result = subtractPolygonOverlap(victim, attacker)

    expect(result.fullCapture).toBe(false)
    expect(result.remainder).not.toBeNull()
    expect(result.remainderAreaM2).toBeGreaterThan(MIN_REMAINDER_AREA_M2)
    expect(result.lostAreaM2).toBeGreaterThan(0)
    expect(result.lostAreaM2).toBeLessThan(turf.area(victim))
    expect(result.intersectionAreaM2).toBeGreaterThan(0)
  })

  it('invasão quase total: fullCapture quando restante abaixo do limiar', () => {
    const victim = squarePolygon(-46.31, -23.55, 0.002)
    const attacker = squarePolygon(-46.309, -23.549, 0.00195)

    const result = subtractPolygonOverlap(victim, attacker)

    expect(result.fullCapture).toBe(true)
    expect(result.remainder).toBeNull()
  })

  it('sem overlap: mantém polígono original', () => {
    const victim = squarePolygon(-46.31, -23.55, 0.01)
    const attacker = squarePolygon(-46.29, -23.54, 0.005)

    const result = subtractPolygonOverlap(victim, attacker)

    expect(result.intersectionAreaM2).toBe(0)
    expect(result.lostAreaM2).toBe(0)
    expect(result.fullCapture).toBe(false)
    expect(result.remainderAreaM2).toBeCloseTo(turf.area(victim), -1)
  })

  it('retorna Polygon válido quando difference gera geometria utilizável', () => {
    const victim = squarePolygon(-46.32, -23.56, 0.012)
    const attacker = turf.buffer(
      turf.lineString([
        [-46.315, -23.56],
        [-46.314, -23.559],
        [-46.313, -23.558],
      ]),
      0.15,
      { units: 'kilometers' },
    ) as Feature<Polygon>

    const result = subtractPolygonOverlap(victim, attacker)

    expect(result.remainder?.geometry.type).toBe('Polygon')
    if (result.remainder) {
      expect(result.remainder.geometry.coordinates[0].length).toBeGreaterThan(3)
    }
  })
})
