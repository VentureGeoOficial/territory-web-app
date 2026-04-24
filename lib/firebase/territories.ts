import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirestoreDb } from './client'
import { isFirebaseConfigured } from './config'
import type { Territory } from '@/lib/territory/types'
import { SUZANO_BOUNDING_BOX, isPositionInsideBox } from '@/lib/territory/regions'
import {
  type TerritoryFirestoreDoc,
  firestoreDocToTerritory,
  territoryToFirestoreDoc,
} from '@/lib/firebase/territory-doc'

export type { TerritoryFirestoreDoc }
export { firestoreDocToTerritory, territoryToFirestoreDoc }

const TERRITORIES = 'territories'
const USERS = 'users'
const PUBLIC_PROFILES = 'publicProfiles'

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

/** Persiste território e atualiza agregados do utilizador. */
export async function saveTerritoryAndUpdateUserStats(
  territory: Territory,
): Promise<void> {
  if (!isFirebaseConfigured()) return

  // Geofence Suzano também no backend para evitar gravações maliciosas
  if (!isPositionInsideBox(territory.center, SUZANO_BOUNDING_BOX)) {
    throw new Error('Território fora da área permitida.')
  }

  const db = getFirestoreDb()
  const payload = territoryToFirestoreDoc(territory)
  const userRef = doc(db, USERS, territory.userId)
  const publicProfileRef = doc(db, PUBLIC_PROFILES, territory.userId)

  await runTransaction(db, async (trx) => {
    const uSnap = await trx.get(userRef)
    const prevArea = uSnap.exists()
      ? Number((uSnap.data() as { totalAreaM2?: number }).totalAreaM2 ?? 0)
      : 0
    const prevCount = uSnap.exists()
      ? Number((uSnap.data() as { territoriesCount?: number }).territoriesCount ?? 0)
      : 0
    // XP mínimo 50 e proporcional à área – regra de produto centralizada aqui
    const xpGain = Math.max(50, Math.round(territory.areaM2 / 100))
    const prevXp = uSnap.exists()
      ? Number((uSnap.data() as { xp?: number }).xp ?? 0)
      : 0

    const territoryRef = doc(db, TERRITORIES, territory.id)
    trx.set(territoryRef, {
      ...payload,
      createdAt: territory.createdAt,
      updatedAt: territory.updatedAt,
    })

    const mergedStats = {
      totalAreaM2: prevArea + territory.areaM2,
      territoriesCount: prevCount + 1,
      xp: prevXp + xpGain,
      updatedAt: serverTimestamp(),
    }

    trx.set(
      userRef,
      mergedStats,
      { merge: true },
    )
    trx.set(
      publicProfileRef,
      mergedStats,
      { merge: true },
    )
  })
}
