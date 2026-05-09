import {
  collection,
  onSnapshot,
  query,
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

const TERRITORIES = 'territories'

/** Escuta todos os territórios (MVP: coleção única; escalar com limite/região depois). */
export function subscribeTerritories(
  onUpdate: (territories: Territory[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe | null {
  if (!isFirebaseConfigured()) return null
  const db = getFirestoreDb()
  const q = query(collection(db, TERRITORIES))
  return onSnapshot(
    q,
    (snap) => {
      const list: Territory[] = []
      snap.forEach((d) => {
        list.push(firestoreDocToTerritory(d.id, d.data() as TerritoryFirestoreDoc))
      })
      onUpdate(list)
    },
    (err) => onError?.(err),
  )
}
