import { describe, expect, it } from 'vitest'
import {
  chunkVisibleUserIds,
  FIRESTORE_IN_MAX,
  mergeTerritoryBatchMaps,
} from '@/lib/firebase/territory-visibility'
import type { Territory } from '@/lib/territory/types'

function makeTerritory(
  id: string,
  userId: string,
  status: Territory['status'] = 'active',
): Territory {
  return {
    id,
    userId,
    userName: 'Test',
    userColor: '#000',
    polygon: {
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
    center: [0, 0],
    areaM2: 100,
    status,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

describe('chunkVisibleUserIds', () => {
  it('returns empty for empty input', () => {
    expect(chunkVisibleUserIds([])).toEqual([])
  })

  it('deduplicates ids', () => {
    const chunks = chunkVisibleUserIds(['a', 'a', 'b'])
    expect(chunks).toHaveLength(1)
    expect(chunks[0]).toEqual(['a', 'b'])
  })

  it('splits into batches of 30', () => {
    const ids = Array.from({ length: 35 }, (_, i) => `user-${i}`)
    const chunks = chunkVisibleUserIds(ids)
    expect(chunks).toHaveLength(2)
    expect(chunks[0]).toHaveLength(FIRESTORE_IN_MAX)
    expect(chunks[1]).toHaveLength(5)
  })

  it('filters falsy ids', () => {
    const chunks = chunkVisibleUserIds(['a', '', 'b'])
    expect(chunks[0]).toEqual(['a', 'b'])
  })
})

describe('mergeTerritoryBatchMaps', () => {
  it('merges multiple batches without duplicates', () => {
    const batchMaps = new Map<number, Map<string, Territory>>()
    batchMaps.set(
      0,
      new Map([['t1', makeTerritory('t1', 'u1')]]),
    )
    batchMaps.set(
      1,
      new Map([['t2', makeTerritory('t2', 'u2')]]),
    )
    const merged = mergeTerritoryBatchMaps(batchMaps)
    expect(merged).toHaveLength(2)
    expect(merged.map((t) => t.id).sort()).toEqual(['t1', 't2'])
  })

  it('later batch overwrites same territory id', () => {
    const batchMaps = new Map<number, Map<string, Territory>>()
    const t1a = makeTerritory('t1', 'u1')
    const t1b = { ...makeTerritory('t1', 'u1'), areaM2: 999 }
    batchMaps.set(0, new Map([['t1', t1a]]))
    batchMaps.set(1, new Map([['t1', t1b]]))
    const merged = mergeTerritoryBatchMaps(batchMaps)
    expect(merged).toHaveLength(1)
    expect(merged[0]!.areaM2).toBe(999)
  })

  it('excludes expired territories', () => {
    const batchMaps = new Map<number, Map<string, Territory>>()
    batchMaps.set(
      0,
      new Map([
        ['t1', makeTerritory('t1', 'u1', 'active')],
        ['t2', makeTerritory('t2', 'u1', 'expired')],
      ]),
    )
    const merged = mergeTerritoryBatchMaps(batchMaps)
    expect(merged).toHaveLength(1)
    expect(merged[0]!.id).toBe('t1')
  })

  it('returns empty for empty batch maps', () => {
    expect(mergeTerritoryBatchMaps(new Map())).toEqual([])
  })
})
