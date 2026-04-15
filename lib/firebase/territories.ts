import type { Feature, Polygon } from 'geojson'
import type { Position } from 'geojson'
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
import type { DominanceLevel, Territory, TerritoryStatus } from '@/lib/territory/types'

const TERRITORIES = 'territories'
const USERS = 'users'

export interface TerritoryFirestoreDoc {
  userId: string
  userName: string
  userColor: string
  polygonJson: string
  areaM2: number
  createdAt: number
  updatedAt: number
  protectedUntil?: number
  status: TerritoryStatus
  dominanceLevel: DominanceLevel
  conquestCount: number
  centerLng: number
  centerLat: number
}

export function territoryToFirestoreDoc(t: Territory): TerritoryFirestoreDoc {
  const [lng, lat] = t.center
  return {
    userId: t.userId,
    userName: t.userName ?? 'Corredor',
    userColor: t.userColor ?? '#CCFF00',
    polygonJson: JSON.stringify(t.polygon),
    areaM2: t.areaM2,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    protectedUntil: t.protectedUntil,
    status: t.status,
    dominanceLevel: t.dominanceLevel,
    conquestCount: t.conquestCount,
    centerLng: lng,
    centerLat: lat,
  }
}

export function firestoreDocToTerritory(
  id: string,
  data: TerritoryFirestoreDoc,
): Territory {
  const polygon = JSON.parse(data.polygonJson) as Feature<Polygon>
  const center: Position = [data.centerLng, data.centerLat]
  return {
    id,
    userId: data.userId,
    userName: data.userName,
    userColor: data.userColor,
    polygon,
    areaM2: data.areaM2,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    protectedUntil: data.protectedUntil,
    status: data.status,
    dominanceLevel: data.dominanceLevel,
    conquestCount: data.conquestCount,
    center,
  }
}

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
  const db = getFirestoreDb()
  const payload = territoryToFirestoreDoc(territory)
  const userRef = doc(db, USERS, territory.userId)

  await runTransaction(db, async (trx) => {
    const uSnap = await trx.get(userRef)
    const prevArea = uSnap.exists()
      ? Number((uSnap.data() as { totalAreaM2?: number }).totalAreaM2 ?? 0)
      : 0
    const prevCount = uSnap.exists()
      ? Number((uSnap.data() as { territoriesCount?: number }).territoriesCount ?? 0)
      : 0
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

    trx.set(
      userRef,
      {
        totalAreaM2: prevArea + territory.areaM2,
        territoriesCount: prevCount + 1,
        xp: prevXp + xpGain,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  })
}
