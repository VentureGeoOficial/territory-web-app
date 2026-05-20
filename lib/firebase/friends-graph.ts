/**
 * Grafo de amizades denormalizado para Firestore Security Rules.
 * Path: `friendships/{ownerUid}/list/{friendUid}`
 *
 * Escrita exclusiva via Admin SDK (Cloud Function / scripts).
 * Leitura permitida apenas ao `ownerUid` (ver `firestore.rules`).
 */

export const FRIENDSHIPS_COLLECTION = 'friendships'
export const FRIENDSHIPS_LIST_SUBCOLLECTION = 'list'

/** Documento de aresta amigo em `friendships/{ownerUid}/list/{friendUid}`. */
export interface FriendshipEdgeDoc {
  /** Timestamp ms em que a amizade foi aceite. */
  since: number
  /** ID do `friendRequests` que originou a aresta. */
  requestId: string
}

/** Path relativo à subcoleção (sem prefixo de database). */
export function friendshipListDocPath(
  ownerUid: string,
  friendUid: string,
): string {
  return `${FRIENDSHIPS_COLLECTION}/${ownerUid}/${FRIENDSHIPS_LIST_SUBCOLLECTION}/${friendUid}`
}
