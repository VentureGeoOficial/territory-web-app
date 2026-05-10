import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
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
  await addDoc(collection(db, REQUESTS), {
    fromUserId,
    toUserId,
    status: 'pending',
    createdAt: Date.now(),
  })
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

  const u1 = onSnapshot(incQ, (snap) => {
    incoming = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<FriendRequestDoc, 'id'>),
    }))
    push()
  })
  const u2 = onSnapshot(outQ, (snap) => {
    outgoing = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<FriendRequestDoc, 'id'>),
    }))
    push()
  })

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
}

export async function rejectFriendRequest(requestId: string): Promise<void> {
  if (!isFirebaseConfigured()) return
  await updateDoc(doc(getFirestoreDb(), REQUESTS, requestId), {
    status: 'rejected',
  })
}

export async function cancelFriendRequest(requestId: string): Promise<void> {
  if (!isFirebaseConfigured()) return
  await updateDoc(doc(getFirestoreDb(), REQUESTS, requestId), {
    status: 'cancelled',
  })
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

  const u1 = onSnapshot(q1, (snap) => {
    a = snap.docs.map((d) => {
      const data = d.data() as { toUserId: string }
      return data.toUserId
    })
    merge()
  })
  const u2 = onSnapshot(q2, (snap) => {
    b = snap.docs.map((d) => {
      const data = d.data() as { fromUserId: string }
      return data.fromUserId
    })
    merge()
  })

  return () => {
    u1()
    u2()
  }
}
