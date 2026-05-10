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

export type { TerritoryFirestoreDoc }
export { firestoreDocToTerritory, territoryToFirestoreDoc }

/** Caixa visível do mapa (lat/lng) para filtrar por centro do polígono persistido. */
export type TerritoryViewportBounds = {
  south: number
  north: number
  west: number
  east: number
}

const TERRITORIES = 'territories'

/** Filtra por longitude no cliente (Firestore permite só uma desigualdade por campo por query). */
function filterByCenterLng(
  list: Territory[],
  west: number,
  east: number,
): Territory[] {
  return list.filter((t) => {
    const lng = t.center[0]
    return lng >= west && lng <= east
  })
}

function mapSnapToTerritories(snap: QuerySnapshot): Territory[] {
  const list: Territory[] = []
  snap.forEach((d) => {
    list.push(
      firestoreDocToTerritory(d.id, d.data() as TerritoryFirestoreDoc),
    )
  })
  return list
}

/**
 * Escuta territórios: com `viewportBounds` usa query por faixa de `centerLat` + filtro lng no cliente
 * (reduz reads vs coleção inteira). Sem bounds mantém comportamento legacy (toda a coleção).
 */
export function subscribeTerritories(
  onUpdate: (territories: Territory[]) => void,
  onError?: (e: Error) => void,
  viewportBounds?: TerritoryViewportBounds | null,
): Unsubscribe | null {
  if (!isFirebaseConfigured()) return null
  const db = getFirestoreDb()

  const useViewport =
    viewportBounds != null &&
    Number.isFinite(viewportBounds.south) &&
    Number.isFinite(viewportBounds.north) &&
    Number.isFinite(viewportBounds.west) &&
    Number.isFinite(viewportBounds.east) &&
    viewportBounds.south <= viewportBounds.north

  if (!useViewport || viewportBounds == null) {
    const q = query(collection(db, TERRITORIES))
    return onSnapshot(
      q,
      (snap) => {
        onUpdate(mapSnapToTerritories(snap))
      },
      (err) => onError?.(err),
    )
  }

  const { south, north, west, east } = viewportBounds
  const q = query(
    collection(db, TERRITORIES),
    where('centerLat', '>=', south),
    where('centerLat', '<=', north),
  )

  return onSnapshot(
    q,
    (snap) => {
      const raw = mapSnapToTerritories(snap)
      onUpdate(filterByCenterLng(raw, west, east))
    },
    (err) => onError?.(err),
  )
}
