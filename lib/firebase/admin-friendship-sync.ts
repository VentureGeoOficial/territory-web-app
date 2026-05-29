import 'server-only'

import {
  FRIENDSHIPS_COLLECTION,
  FRIENDSHIPS_LIST_SUBCOLLECTION,
  type FriendshipEdgeDoc,
} from '@/lib/firebase/friends-graph'
import { getAdminFirestore } from '@/lib/firebase/admin-app'
import { log } from '@/lib/logging/logger'

const REQUESTS = 'friendRequests'

export class AcceptFriendError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'AcceptFriendError'
  }
}

function friendshipEdgeRef(
  db: ReturnType<typeof getAdminFirestore>,
  ownerUid: string,
  friendUid: string,
) {
  return db
    .collection(FRIENDSHIPS_COLLECTION)
    .doc(ownerUid)
    .collection(FRIENDSHIPS_LIST_SUBCOLLECTION)
    .doc(friendUid)
}

/**
 * Cria arestas bidirecionais no grafo `friendships` (idempotente).
 * Espelha `createFriendshipEdges` em `functions/src/index.ts`.
 */
export async function createFriendshipEdges(
  fromUserId: string,
  toUserId: string,
  requestId: string,
): Promise<void> {
  if (!fromUserId || !toUserId || fromUserId === toUserId) {
    log.warn({
      scope: 'AdminFriendshipSync',
      event: 'friendship_edge_skipped_invalid_users',
      requestIdPrefix: requestId.slice(0, 8),
    })
    return
  }

  const db = getAdminFirestore()
  const since = Date.now()
  const edge: FriendshipEdgeDoc = { since, requestId }

  await db.runTransaction(async (tx) => {
    const refA = friendshipEdgeRef(db, fromUserId, toUserId)
    const refB = friendshipEdgeRef(db, toUserId, fromUserId)
    const [snapA, snapB] = await Promise.all([tx.get(refA), tx.get(refB)])
    if (!snapA.exists) tx.set(refA, edge)
    if (!snapB.exists) tx.set(refB, edge)
  })

  log.info({
    scope: 'AdminFriendshipSync',
    event: 'friendship_edge_created',
    fromPrefix: fromUserId.slice(0, 8),
    toPrefix: toUserId.slice(0, 8),
    requestIdPrefix: requestId.slice(0, 8),
  })
}

export interface AcceptFriendRequestResult {
  fromUserId: string
  toUserId: string
  alreadyAccepted: boolean
}

/**
 * Aceita pedido de amizade e popula grafo `friendships` na mesma transação.
 * Idempotente se o pedido já estiver `accepted` (recria arestas em falta).
 */
export async function acceptFriendRequestWithGraph(
  requestId: string,
  callerUid: string,
): Promise<AcceptFriendRequestResult> {
  const db = getAdminFirestore()
  const reqRef = db.collection(REQUESTS).doc(requestId)

  log.info({
    scope: 'AdminFriendshipSync',
    event: 'accept_request_start',
    uid: callerUid,
    requestIdPrefix: requestId.slice(0, 8),
  })

  const snap = await reqRef.get()
  if (!snap.exists) {
    throw new AcceptFriendError('Pedido não encontrado.', 404)
  }

  const data = snap.data()!
  const fromUserId = String(data.fromUserId ?? '')
  const toUserId = String(data.toUserId ?? '')
  const status = String(data.status ?? '')

  if (!fromUserId || !toUserId || fromUserId === toUserId) {
    throw new AcceptFriendError('Pedido inválido.', 400)
  }

  if (toUserId !== callerUid) {
    throw new AcceptFriendError('Sem permissão para aceitar este pedido.', 403)
  }

  if (status === 'accepted') {
    await createFriendshipEdges(fromUserId, toUserId, requestId)
    log.info({
      scope: 'AdminFriendshipSync',
      event: 'accept_request_idempotent',
      uid: callerUid,
      requestIdPrefix: requestId.slice(0, 8),
    })
    return { fromUserId, toUserId, alreadyAccepted: true }
  }

  if (status !== 'pending') {
    throw new AcceptFriendError('Pedido não está pendente.', 409)
  }

  const since = Date.now()
  const edge: FriendshipEdgeDoc = { since, requestId }

  const refA = friendshipEdgeRef(db, fromUserId, toUserId)
  const refB = friendshipEdgeRef(db, toUserId, fromUserId)

  await db.runTransaction(async (tx) => {
    // Firestore exige TODAS as leituras antes de qualquer escrita.
    const [fresh, snapA, snapB] = await Promise.all([
      tx.get(reqRef),
      tx.get(refA),
      tx.get(refB),
    ])

    if (!fresh.exists) {
      throw new AcceptFriendError('Pedido não encontrado.', 404)
    }
    const freshStatus = String(fresh.data()!.status ?? '')
    if (freshStatus !== 'pending') {
      throw new AcceptFriendError('Pedido não está pendente.', 409)
    }

    tx.update(reqRef, { status: 'accepted' })
    if (!snapA.exists) tx.set(refA, edge)
    if (!snapB.exists) tx.set(refB, edge)
  })

  log.info({
    scope: 'AdminFriendshipSync',
    event: 'accept_request_completed',
    uid: callerUid,
    requestIdPrefix: requestId.slice(0, 8),
    fromPrefix: fromUserId.slice(0, 8),
    toPrefix: toUserId.slice(0, 8),
  })

  return { fromUserId, toUserId, alreadyAccepted: false }
}
