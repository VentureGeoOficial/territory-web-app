import * as admin from 'firebase-admin'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'

admin.initializeApp()
const db = getFirestore()

const FRIEND_REQUESTS = 'friendRequests'
const FRIENDSHIPS = 'friendships'
const FRIENDSHIPS_LIST = 'list'

function maskUid(uid: string): string {
  return uid.length <= 8 ? `${uid.slice(0, 4)}…` : `${uid.slice(0, 8)}…`
}

function logFriendship(
  level: 'INFO' | 'WARNING' | 'ERROR',
  event: string,
  ctx: Record<string, unknown>,
): void {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    scope: 'friendship',
    event,
    ...ctx,
  })
  if (level === 'ERROR') console.error(line)
  else if (level === 'WARNING') console.warn(line)
  else console.info(line)
}

function friendshipEdgeRef(ownerUid: string, friendUid: string) {
  return db
    .collection(FRIENDSHIPS)
    .doc(ownerUid)
    .collection(FRIENDSHIPS_LIST)
    .doc(friendUid)
}

async function createFriendshipEdges(
  fromUserId: string,
  toUserId: string,
  requestId: string,
): Promise<void> {
  const since = Date.now()
  const edge = { since, requestId }

  await db.runTransaction(async (tx) => {
    const refA = friendshipEdgeRef(fromUserId, toUserId)
    const refB = friendshipEdgeRef(toUserId, fromUserId)
    const [snapA, snapB] = await Promise.all([tx.get(refA), tx.get(refB)])
    if (!snapA.exists) tx.set(refA, edge)
    if (!snapB.exists) tx.set(refB, edge)
  })

  logFriendship('INFO', 'friendship_edge_created', {
    fromPrefix: maskUid(fromUserId),
    toPrefix: maskUid(toUserId),
    requestIdPrefix: requestId.slice(0, 8),
  })
}

async function removeFriendshipEdges(
  fromUserId: string,
  toUserId: string,
): Promise<void> {
  await db.runTransaction(async (tx) => {
    tx.delete(friendshipEdgeRef(fromUserId, toUserId))
    tx.delete(friendshipEdgeRef(toUserId, fromUserId))
  })

  logFriendship('INFO', 'friendship_edge_removed', {
    fromPrefix: maskUid(fromUserId),
    toPrefix: maskUid(toUserId),
  })
}

/**
 * Mantém `friendships/{owner}/list/{friend}` sincronizado com `friendRequests` aceites.
 */
export const onFriendRequestStatusChange = onDocumentUpdated(
  {
    document: `${FRIEND_REQUESTS}/{requestId}`,
    region: 'southamerica-east1',
  },
  async (event) => {
    const before = event.data?.before.data()
    const after = event.data?.after.data()
    if (!before || !after) return

    const prevStatus = String(before.status ?? '')
    const nextStatus = String(after.status ?? '')
    if (prevStatus === nextStatus) return

    const fromUserId = String(after.fromUserId ?? '')
    const toUserId = String(after.toUserId ?? '')
    const requestId = event.params.requestId

    if (!fromUserId || !toUserId || fromUserId === toUserId) {
      logFriendship('WARNING', 'friendship_edge_skipped_invalid_users', {
        requestIdPrefix: requestId.slice(0, 8),
      })
      return
    }

    try {
      if (prevStatus === 'pending' && nextStatus === 'accepted') {
        await createFriendshipEdges(fromUserId, toUserId, requestId)
      } else if (
        prevStatus === 'accepted' &&
        (nextStatus === 'rejected' || nextStatus === 'cancelled')
      ) {
        await removeFriendshipEdges(fromUserId, toUserId)
      }
    } catch (e) {
      logFriendship('ERROR', 'friendship_edge_sync_failed', {
        requestIdPrefix: requestId.slice(0, 8),
        prevStatus,
        nextStatus,
        message: e instanceof Error ? e.message : 'unknown',
      })
      throw e
    }
  },
)

const ACTIVE_MAX_MS = 24 * 60 * 60 * 1000
const STALE_PROTECTED_DISPUTED_MS = 7 * 24 * 60 * 60 * 1000
const BATCH_SAFE = 450

async function expireByStatus(
  status: 'active' | 'protected' | 'disputed',
  cutoff: number,
): Promise<void> {
  const snap = await db
    .collection('territories')
    .where('status', '==', status)
    .where('createdAt', '<', cutoff)
    .get()

  if (snap.empty) return

  const ownerDeltas = new Map<string, { area: number; count: number }>()
  let batch = db.batch()
  let ops = 0

  for (const doc of snap.docs) {
    const data = doc.data()
    const ownerId = String(data.userId ?? '')
    const area = Number(data.areaM2 ?? 0)

    batch.update(doc.ref, { status: 'expired', updatedAt: Date.now() })
    ops++

    if (ownerId) {
      const prev = ownerDeltas.get(ownerId) ?? { area: 0, count: 0 }
      ownerDeltas.set(ownerId, {
        area: prev.area + area,
        count: prev.count + 1,
      })
    }

    if (ops >= BATCH_SAFE) {
      await batch.commit()
      batch = db.batch()
      ops = 0
    }
  }

  if (ops > 0) await batch.commit()

  let userBatch = db.batch()
  let userOps = 0

  for (const [ownerId, delta] of ownerDeltas) {
    const userRef = db.collection('users').doc(ownerId)
    const publicRef = db.collection('publicProfiles').doc(ownerId)

    userBatch.set(
      userRef,
      {
        totalAreaM2: FieldValue.increment(-delta.area),
        territoriesCount: FieldValue.increment(-delta.count),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
    userOps++

    userBatch.set(
      publicRef,
      {
        totalAreaM2: FieldValue.increment(-delta.area),
        territoriesCount: FieldValue.increment(-delta.count),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
    userOps++

    if (userOps >= BATCH_SAFE) {
      await userBatch.commit()
      userBatch = db.batch()
      userOps = 0
    }
  }

  if (userOps > 0) await userBatch.commit()
}

/**
 * A cada hora: expira territórios `active` (>24h), `protected` e `disputed` (>7 dias).
 */
export const expireStaleTerritories = onSchedule(
  {
    schedule: 'every 60 minutes',
    timeZone: 'America/Sao_Paulo',
    region: 'southamerica-east1',
  },
  async () => {
    const now = Date.now()
    await expireByStatus('active', now - ACTIVE_MAX_MS)
    await expireByStatus('protected', now - STALE_PROTECTED_DISPUTED_MS)
    await expireByStatus('disputed', now - STALE_PROTECTED_DISPUTED_MS)
  },
)
