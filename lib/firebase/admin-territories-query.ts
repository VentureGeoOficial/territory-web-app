import 'server-only'

import type { Territory } from '@/lib/territory/types'
import {
  firestoreDocToTerritory,
  type TerritoryFirestoreDoc,
} from '@/lib/firebase/territory-doc'
import { getAdminFirestore } from '@/lib/firebase/admin-app'

/**
 * Territórios ainda relevantes para interseção / captura (exclui `expired`).
 * Deve incluir todos os candidatos a sobreposição — não filtrar por centro para não omitir polígonos na borda.
 */
export async function queryTerritoriesForGameplay(): Promise<Territory[]> {
  const db = getAdminFirestore()
  const snap = await db
    .collection('territories')
    .where('status', 'in', ['active', 'disputed', 'protected'])
    .get()

  return snap.docs.map((d) =>
    firestoreDocToTerritory(d.id, d.data() as TerritoryFirestoreDoc),
  )
}
