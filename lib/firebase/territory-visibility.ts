import type { Territory } from '@/lib/territory/types'

/** Limite do operador `in` do Firestore. */
export const FIRESTORE_IN_MAX = 30

const ACTIVE_STATUSES: Territory['status'][] = [
  'active',
  'disputed',
  'protected',
]

/** Particiona IDs visíveis em chunks para queries `where('userId','in', chunk)`. */
export function chunkVisibleUserIds(
  ids: string[],
  maxChunk = FIRESTORE_IN_MAX,
): string[][] {
  const unique = [...new Set(ids.filter(Boolean))]
  if (unique.length === 0) return []
  const chunks: string[][] = []
  for (let i = 0; i < unique.length; i += maxChunk) {
    chunks.push(unique.slice(i, i + maxChunk))
  }
  return chunks
}

/** Junta mapas por batch numa lista única, filtrando status activos. */
export function mergeTerritoryBatchMaps(
  batchMaps: Map<number, Map<string, Territory>>,
): Territory[] {
  const merged = new Map<string, Territory>()
  for (const batchMap of batchMaps.values()) {
    for (const [id, t] of batchMap) {
      merged.set(id, t)
    }
  }
  return Array.from(merged.values()).filter((t) =>
    ACTIVE_STATUSES.includes(t.status),
  )
}
