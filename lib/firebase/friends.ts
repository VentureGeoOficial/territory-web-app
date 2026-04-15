import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirestoreDb } from './client'
import { isFirebaseConfigured } from './config'

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected'

export interface FriendRequestDoc {
  id: string
  fromUserId: string
  toUserId: string
  status: FriendRequestStatus
  createdAt: number
}

const REQUESTS = 'friendRequests'

export async function findUserIdByEmail(email: string): Promise<string | null> {
  if (!isFirebaseConfigured()) return null
  const db = getFirestoreDb()
  const q = query(
    collection(db, 'users'),
    where('email', '==', email.trim().toLowerCase()),
    limit(1),
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  return snap.docs[0]!.id
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
