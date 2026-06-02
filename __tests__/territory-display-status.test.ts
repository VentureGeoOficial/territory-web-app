import { describe, expect, it } from 'vitest'
import type { Territory } from '@/lib/territory/types'
import { getTerritoryDisplayStatus } from '@/lib/territory/territory-display-status'

function baseTerritory(overrides: Partial<Territory> = {}): Territory {
  return {
    id: 't1',
    userId: 'u1',
    polygon: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0],
          ],
        ],
      },
    },
    areaM2: 100,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: 'active',
    dominanceLevel: 'bronze',
    conquestCount: 1,
    center: [0.5, 0.5],
    ...overrides,
  }
}

describe('getTerritoryDisplayStatus', () => {
  const now = 1_000_000

  it('mostra Protegido quando protectedUntil está no futuro (legado active)', () => {
    const t = baseTerritory({
      status: 'active',
      protectedUntil: now + 60_000,
    })
    expect(getTerritoryDisplayStatus(t, now).label).toBe('Protegido')
    expect(getTerritoryDisplayStatus(t, now).kind).toBe('protected')
  })

  it('mostra Protegido quando status é protected e janela válida', () => {
    const t = baseTerritory({
      status: 'protected',
      protectedUntil: now + 60_000,
    })
    expect(getTerritoryDisplayStatus(t, now).label).toBe('Protegido')
  })

  it('mostra Desprotegido após expirar protectedUntil', () => {
    const t = baseTerritory({
      status: 'protected',
      protectedUntil: now - 1,
    })
    expect(getTerritoryDisplayStatus(t, now).label).toBe('Desprotegido')
    expect(getTerritoryDisplayStatus(t, now).kind).toBe('unprotected')
  })

  it('mantém Em Disputa independentemente de protectedUntil', () => {
    const t = baseTerritory({
      status: 'disputed',
      protectedUntil: now + 60_000,
    })
    expect(getTerritoryDisplayStatus(t, now).label).toBe('Em Disputa')
  })

  it('mostra Expirado', () => {
    const t = baseTerritory({ status: 'expired' })
    expect(getTerritoryDisplayStatus(t, now).label).toBe('Expirado')
  })
})
