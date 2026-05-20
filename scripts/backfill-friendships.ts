/**
 * Backfill `friendships/{ownerUid}/list/{friendUid}` a partir de `friendRequests` aceites.
 * Uso: npx tsx scripts/backfill-friendships.ts
 * Requer FIREBASE_SERVICE_ACCOUNT_JSON no ambiente.
 *
 * Correr ANTES de apertar as Firestore rules de territórios.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import {
  FRIENDSHIPS_COLLECTION,
  FRIENDSHIPS_LIST_SUBCOLLECTION,
  type FriendshipEdgeDoc,
} from '../lib/firebase/friends-graph'

const REQUESTS = 'friendRequests'
const BATCH_SIZE = 400

function log(
  level: 'INFO' | 'WARNING' | 'CRITICAL',
  event: string,
  ctx: Record<string, unknown>,
): void {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    scope: 'friendships_backfill',
    event,
    ...ctx,
  })
  if (level === 'CRITICAL') console.error(line)
  else if (level === 'WARNING') console.warn(line)
  else console.info(line)
}

function edgeRef(db: Firestore, ownerUid: string, friendUid: string) {
  return db
    .collection(FRIENDSHIPS_COLLECTION)
    .doc(ownerUid)
    .collection(FRIENDSHIPS_LIST_SUBCOLLECTION)
    .doc(friendUid)
}

async function main() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!json) {
    log('CRITICAL', 'friendships_backfill_missing_credentials', {})
    process.exit(1)
  }

  if (getApps().length === 0) {
    initializeApp({ credential: cert(JSON.parse(json)) })
  }

  const db = getFirestore()

  log('INFO', 'friendships_backfill_started', {})

  const snap = await db
    .collection(REQUESTS)
    .where('status', '==', 'accepted')
    .get()

  let edgesWritten = 0
  let batch = db.batch()
  let ops = 0

  for (const doc of snap.docs) {
    const data = doc.data()
    const fromUserId = String(data.fromUserId ?? '')
    const toUserId = String(data.toUserId ?? '')
    if (!fromUserId || !toUserId || fromUserId === toUserId) continue

    const since = Number(data.createdAt ?? Date.now())
    const edge: FriendshipEdgeDoc = { since, requestId: doc.id }

    const refA = edgeRef(db, fromUserId, toUserId)
    const refB = edgeRef(db, toUserId, fromUserId)

    batch.set(refA, edge, { merge: true })
    batch.set(refB, edge, { merge: true })
    ops += 2
    edgesWritten += 2

    if (ops >= BATCH_SIZE) {
      await batch.commit()
      batch = db.batch()
      ops = 0
    }
  }

  if (ops > 0) await batch.commit()

  log('INFO', 'friendships_backfill_completed', {
    acceptedRequests: snap.size,
    edgesWritten,
    expectedEdges: snap.size * 2,
  })
}

main().catch((e) => {
  log('CRITICAL', 'friendships_backfill_failed', {
    message: e instanceof Error ? e.message : 'unknown',
  })
  process.exit(1)
})
