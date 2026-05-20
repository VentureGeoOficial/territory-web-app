import {
  collection,
  onSnapshot,
  query,
  where,
  type QuerySnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirestoreDb } from './client'
import { isFirebaseConfigured } from './config'
import type { Territory } from '@/lib/territory/types'
import {
  type TerritoryFirestoreDoc,
  firestoreDocToTerritory,
  territoryToFirestoreDoc,
} from '@/lib/firebase/territory-doc'
import { log } from '@/lib/logging/logger'
import {
  chunkVisibleUserIds,
  mergeTerritoryBatchMaps,
} from '@/lib/firebase/territory-visibility'

export type { TerritoryFirestoreDoc }
export { firestoreDocToTerritory, territoryToFirestoreDoc }
export { chunkVisibleUserIds, mergeTerritoryBatchMaps } from '@/lib/firebase/territory-visibility'

/** Caixa visível do mapa (lat/lng) para filtrar por centro do polígono no cliente. */
export type TerritoryViewportBounds = {
  south: number
  north: number
  west: number
  east: number
}

const TERRITORIES = 'territories'

const ACTIVE_STATUSES: Territory['status'][] = [
  'active',
  'disputed',
  'protected',
]

function mapSnapToTerritories(snap: QuerySnapshot): Territory[] {
  const list: Territory[] = []
  snap.forEach((d) => {
    list.push(
      firestoreDocToTerritory(d.id, d.data() as TerritoryFirestoreDoc),
    )
  })
  return list.filter((t) => ACTIVE_STATUSES.includes(t.status))
}

/** Territórios cujo centro está dentro da caixa visível (filtro client-side). */
export function filterTerritoriesByViewport(
  list: Territory[],
  bounds: TerritoryViewportBounds,
): Territory[] {
  const { south, north, west, east } = bounds
  return list.filter((t) => {
    const [lng, lat] = t.center
    return lat >= south && lat <= north && lng >= west && lng <= east
  })
}

export type SubscribeTerritoriesParams = {
  /** IDs de utilizadores cujos territórios o viewer pode ver (próprio + amigos). */
  visibleUserIds: string[]
  onUpdate: (territories: Territory[]) => void
  onError?: (e: Error) => void
  /** UID do viewer (para logs; opcional). */
  viewerUid?: string
}

/**
 * Escuta territórios activos apenas de `visibleUserIds` (próprio + amigos).
 * Particiona em batches de ≤30 por limite do operador `in` do Firestore.
 */
export function subscribeTerritories(
  params: SubscribeTerritoriesParams,
): Unsubscribe | null {
  const { visibleUserIds, onUpdate, onError, viewerUid } = params

  if (!isFirebaseConfigured()) return null

  const chunks = chunkVisibleUserIds(visibleUserIds)

  if (chunks.length === 0) {
    onUpdate([])
    return () => {}
  }

  const db = getFirestoreDb()
  const batchMaps = new Map<number, Map<string, Territory>>()
  const unsubs: Unsubscribe[] = []

  const rebuildAndEmit = () => {
    const list = mergeTerritoryBatchMaps(batchMaps)
    log.info({
      scope: 'territory_visibility',
      event: 'territory_visibility_received',
      uid: viewerUid,
      totalDocs: list.length,
      batchCount: chunks.length,
    })
    onUpdate(list)
  }

  log.info({
    scope: 'territory_visibility',
    event: 'territory_visibility_subscribed',
    uid: viewerUid,
    friendCount: Math.max(0, visibleUserIds.length - 1),
    batchCount: chunks.length,
  })

  chunks.forEach((chunk, batchIndex) => {
    const q = query(
      collection(db, TERRITORIES),
      where('userId', 'in', chunk),
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        const batchMap = new Map<string, Territory>()
        for (const t of mapSnapToTerritories(snap)) {
          batchMap.set(t.id, t)
        }
        batchMaps.set(batchIndex, batchMap)
        rebuildAndEmit()
      },
      (err) => {
        const code =
          err && typeof err === 'object' && 'code' in err
            ? String((err as { code?: string }).code)
            : undefined
        log.error({
          scope: 'territory_visibility',
          event: 'territory_visibility_error',
          uid: viewerUid,
          batchIndex,
          code,
          message: err.message,
        })
        onError?.(err)
      },
    )
    unsubs.push(unsub)
  })

  return () => {
    unsubs.forEach((u) => u())
  }
}
