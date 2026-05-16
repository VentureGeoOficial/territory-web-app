import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirestoreDb } from './client'
import { isFirebaseConfigured } from './config'

export type FriendRequestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'

export interface FriendRequestDoc {
  id: string
  fromUserId: string
  toUserId: string
  status: FriendRequestStatus
  createdAt: number
}

const REQUESTS = 'friendRequests'

/**
 * Slug username permitido. Alinhado com:
 *  - `firestore.rules` (collection `usernames` → `slug.matches('^[a-z0-9_]{3,30}$')`)
 *  - `lib/auth/schemas.ts` (signup)
 *  - `app/api/auth/create-profile`, `app/api/auth/resolve-identifier`
 *  - `app/api/friends/lookup`
 *
 * Histórico: este pattern usava `{3,20}` e não combinava com o resto do sistema —
 * utilizadores com username 21–30 chars (criados via signup válido) ficavam sem
 * possibilidade de ser adicionados como amigos.
 */
export const FRIEND_USERNAME_SLUG_PATTERN = /^[a-z0-9_]{3,30}$/

export type ValidateFriendshipResult =
  | { ok: true }
  | {
      ok: false
      reason: 'self' | 'already_friend' | 'pending_outgoing' | 'pending_incoming'
    }

/**
 * Validação só no cliente antes do lookup — não substitui verificação em `sendFriendRequest`.
 */
export function validateNoExistingFriendship(params: {
  uid: string
  targetUid: string
  friendIds: string[]
  incoming: FriendRequestDoc[]
  outgoing: FriendRequestDoc[]
}): ValidateFriendshipResult {
  const { uid, targetUid, friendIds, incoming, outgoing } = params
  if (targetUid === uid) return { ok: false, reason: 'self' }
  if (friendIds.includes(targetUid)) return { ok: false, reason: 'already_friend' }
  if (outgoing.some((r) => r.toUserId === targetUid)) {
    return { ok: false, reason: 'pending_outgoing' }
  }
  if (incoming.some((r) => r.fromUserId === targetUid)) {
    return { ok: false, reason: 'pending_incoming' }
  }
  return { ok: true }
}

/**
 * Verifica duplicação de aresta amigo entre `callerUid` (igual a `request.auth.uid`)
 * e `otherUid`. Faz **quatro** queries — todas filtradas por `fromUserId == callerUid`
 * OU `toUserId == callerUid` — para respeitar as regras de segurança do Firestore
 * (`friendRequests` só permite leitura quando o caller é from/to). Cobre status
 * `pending` e `accepted` em ambas as direções.
 *
 * Importante: queries do tipo `where('fromUserId','==', otherUid)` violam as
 * regras quando o resultado contém docs que não envolvem o caller — gerava
 * `PERMISSION_DENIED` intermitente e era a causa principal de falhas silenciosas
 * em "Adicionar amigos".
 */
async function findDuplicateEdgeForCaller(
  db: Firestore,
  callerUid: string,
  otherUid: string,
): Promise<boolean> {
  // (1) Pedidos onde eu sou o emissor (pending/accepted) e o destinatário é `otherUid`.
  for (const status of ['pending', 'accepted'] as const) {
    const q = query(
      collection(db, REQUESTS),
      where('fromUserId', '==', callerUid),
      where('status', '==', status),
    )
    const snap = await getDocs(q)
    for (const d of snap.docs) {
      const data = d.data() as { toUserId?: string }
      if (data.toUserId === otherUid) return true
    }
  }
  // (2) Pedidos onde eu sou o destinatário (pending/accepted) e o emissor é `otherUid`.
  for (const status of ['pending', 'accepted'] as const) {
    const q = query(
      collection(db, REQUESTS),
      where('toUserId', '==', callerUid),
      where('status', '==', status),
    )
    const snap = await getDocs(q)
    for (const d of snap.docs) {
      const data = d.data() as { fromUserId?: string }
      if (data.fromUserId === otherUid) return true
    }
  }
  return false
}

export type LookupFriendUidResult =
  | { kind: 'found'; uid: string }
  | { kind: 'not_found' }
  | {
      kind: 'error'
      code:
        | 'firebase_not_configured'
        | 'unauthorized'
        | 'service_unavailable'
        | 'bad_request'
        | 'internal'
      httpStatus?: number
    }

export async function lookupFriendUid(params: {
  email?: string
  username?: string
  idToken: string
}): Promise<LookupFriendUidResult> {
  if (!isFirebaseConfigured()) {
    return { kind: 'error', code: 'firebase_not_configured' }
  }
  const res = await fetch('/api/friends/lookup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.idToken}`,
    },
    body: JSON.stringify({
      email: params.email,
      username: params.username,
    }),
  })
  const data = (await res.json().catch(() => ({}))) as {
    uid?: string | null
    error?: string
  }
  if (!res.ok) {
    console.warn('[lookupFriendUid] API error', { status: res.status })
    if (res.status === 401) {
      return { kind: 'error', code: 'unauthorized', httpStatus: 401 }
    }
    if (res.status === 503) {
      return { kind: 'error', code: 'service_unavailable', httpStatus: 503 }
    }
    if (res.status === 400) {
      return { kind: 'error', code: 'bad_request', httpStatus: 400 }
    }
    if (res.status >= 500) {
      return { kind: 'error', code: 'internal', httpStatus: res.status }
    }
    return { kind: 'error', code: 'internal', httpStatus: res.status }
  }
  if (typeof data.uid === 'string') {
    return { kind: 'found', uid: data.uid }
  }
  return { kind: 'not_found' }
}

export async function sendFriendRequest(
  fromUserId: string,
  toUserId: string,
): Promise<void> {
  if (!isFirebaseConfigured()) return
  if (fromUserId === toUserId) throw new Error('Não pode adicionar a si mesmo.')
  const db = getFirestoreDb()
  // `fromUserId` aqui é sempre o caller autenticado (passado pela UI como `uid`
  // do `useAuthStore`). A função abaixo só executa queries autorizadas pelas
  // rules (filtradas por callerUid em from/to).
  const duplicate = await findDuplicateEdgeForCaller(db, fromUserId, toUserId)
  if (duplicate) {
    throw new Error('DUPLICATE_REQUEST')
  }
  await addDoc(collection(db, REQUESTS), {
    fromUserId,
    toUserId,
    status: 'pending',
    createdAt: Date.now(),
  })
  console.info(
    '[friends]',
    JSON.stringify({
      event: 'request_sent',
      fromPrefix: fromUserId.slice(0, 8),
      toPrefix: toUserId.slice(0, 8),
    }),
  )
}

export function subscribeFriendRequests(
  userId: string,
  onUpdate: (incoming: FriendRequestDoc[], outgoing: FriendRequestDoc[]) => void,
): Unsubscribe | null {
  if (!isFirebaseConfigured()) return null
  const db = getFirestoreDb()

  const incQ = query(
    collection(db, REQUESTS),
    where('toUserId', '==', userId),
    where('status', '==', 'pending'),
  )
  const outQ = query(
    collection(db, REQUESTS),
    where('fromUserId', '==', userId),
    where('status', '==', 'pending'),
  )

  let incoming: FriendRequestDoc[] = []
  let outgoing: FriendRequestDoc[] = []

  const push = () => onUpdate(incoming, outgoing)

  const onListenErr = (scope: string) => (e: Error) => {
    console.warn('[subscribeFriendRequests]', scope, { message: e.message })
  }

  const u1 = onSnapshot(
    incQ,
    (snap) => {
      incoming = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FriendRequestDoc, 'id'>),
      }))
      push()
    },
    onListenErr('incoming'),
  )
  const u2 = onSnapshot(
    outQ,
    (snap) => {
      outgoing = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FriendRequestDoc, 'id'>),
      }))
      push()
    },
    onListenErr('outgoing'),
  )

  return () => {
    u1()
    u2()
  }
}

export async function acceptFriendRequest(requestId: string): Promise<void> {
  if (!isFirebaseConfigured()) return
  await updateDoc(doc(getFirestoreDb(), REQUESTS, requestId), {
    status: 'accepted',
  })
  console.info(
    '[friends]',
    JSON.stringify({
      event: 'request_accepted',
      requestIdPrefix: requestId.slice(0, 8),
    }),
  )
}

export async function rejectFriendRequest(requestId: string): Promise<void> {
  if (!isFirebaseConfigured()) return
  await updateDoc(doc(getFirestoreDb(), REQUESTS, requestId), {
    status: 'rejected',
  })
  console.info(
    '[friends]',
    JSON.stringify({
      event: 'request_rejected',
      requestIdPrefix: requestId.slice(0, 8),
    }),
  )
}

export async function cancelFriendRequest(requestId: string): Promise<void> {
  if (!isFirebaseConfigured()) return
  await updateDoc(doc(getFirestoreDb(), REQUESTS, requestId), {
    status: 'cancelled',
  })
  console.info(
    '[friends]',
    JSON.stringify({
      event: 'request_cancelled',
      requestIdPrefix: requestId.slice(0, 8),
    }),
  )
}

/** Amigos: pedidos aceites envolvendo o utilizador (duas queries indexadas). */
export function subscribeAcceptedFriends(
  userId: string,
  onUpdate: (friendIds: string[]) => void,
): Unsubscribe | null {
  if (!isFirebaseConfigured()) return null
  const db = getFirestoreDb()
  const q1 = query(
    collection(db, REQUESTS),
    where('fromUserId', '==', userId),
    where('status', '==', 'accepted'),
  )
  const q2 = query(
    collection(db, REQUESTS),
    where('toUserId', '==', userId),
    where('status', '==', 'accepted'),
  )

  let a: string[] = []
  let b: string[] = []

  const merge = () => {
    const ids = new Set<string>()
    a.forEach((id) => ids.add(id))
    b.forEach((id) => ids.add(id))
    onUpdate(Array.from(ids))
  }

  const onListenErr = (scope: string) => (e: Error) => {
    console.warn('[subscribeAcceptedFriends]', scope, { message: e.message })
  }

  const u1 = onSnapshot(
    q1,
    (snap) => {
      a = snap.docs.map((d) => {
        const data = d.data() as { toUserId: string }
        return data.toUserId
      })
      merge()
    },
    onListenErr('from_user_accepted'),
  )
  const u2 = onSnapshot(
    q2,
    (snap) => {
      b = snap.docs.map((d) => {
        const data = d.data() as { fromUserId: string }
        return data.fromUserId
      })
      merge()
    },
    onListenErr('to_user_accepted'),
  )

  return () => {
    u1()
    u2()
  }
}
