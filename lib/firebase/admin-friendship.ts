import 'server-only'

import {
  FRIENDSHIPS_COLLECTION,
  FRIENDSHIPS_LIST_SUBCOLLECTION,
} from '@/lib/firebase/friends-graph'
import { getAdminFirestore } from '@/lib/firebase/admin-app'
import { log } from '@/lib/logging/logger'

/**
 * IDs de amigos diretos do utilizador (grafo denormalizado usado pelas rules).
 * Path: `friendships/{uid}/list/{friendUid}`
 */
export async function getFriendOwnerIds(uid: string): Promise<Set<string>> {
  const db = getAdminFirestore()
  const snap = await db
    .collection(FRIENDSHIPS_COLLECTION)
    .doc(uid)
    .collection(FRIENDSHIPS_LIST_SUBCOLLECTION)
    .get()

  const ids = new Set<string>()
  for (const doc of snap.docs) {
    ids.add(doc.id)
  }

  log.info({
    scope: 'AdminFriendship',
    event: 'friend_ids_loaded',
    uid,
    count: ids.size,
  })

  return ids
}

/** Verifica amizade par-a-par via grafo `friendships`. */
export async function areFriends(
  uidA: string,
  uidB: string,
): Promise<boolean> {
  if (uidA === uidB) return false

  const db = getAdminFirestore()
  const edge = await db
    .collection(FRIENDSHIPS_COLLECTION)
    .doc(uidA)
    .collection(FRIENDSHIPS_LIST_SUBCOLLECTION)
    .doc(uidB)
    .get()

  return edge.exists
}
