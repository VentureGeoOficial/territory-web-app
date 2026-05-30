/**
 * Backfill `usernames/{slug}` a partir de `users/{uid}.username`.
 * Uso: npm run backfill:usernames
 * Requer FIREBASE_SERVICE_ACCOUNT_JSON no ambiente.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

const USERS = 'users'
const USERNAMES = 'usernames'
const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/
const BATCH_SIZE = 400

function log(
  level: 'INFO' | 'WARNING' | 'CRITICAL',
  event: string,
  ctx: Record<string, unknown>,
): void {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    scope: 'usernames_backfill',
    event,
    ...ctx,
  })
  if (level === 'CRITICAL') console.error(line)
  else if (level === 'WARNING') console.warn(line)
  else console.info(line)
}

function usernameRef(db: Firestore, slug: string) {
  return db.collection(USERNAMES).doc(slug)
}

async function main() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!json) {
    log('CRITICAL', 'usernames_backfill_missing_credentials', {})
    process.exit(1)
  }

  if (getApps().length === 0) {
    initializeApp({ credential: cert(JSON.parse(json)) })
  }

  const db = getFirestore()

  log('INFO', 'usernames_backfill_started', {})

  const snap = await db.collection(USERS).get()

  let scanned = 0
  let written = 0
  let skipped = 0
  let invalid = 0
  let batch = db.batch()
  let ops = 0

  for (const userDoc of snap.docs) {
    scanned++
    const uid = userDoc.id
    const slug = String(userDoc.data()?.username ?? '').trim().toLowerCase()

    if (!slug) {
      skipped++
      continue
    }

    if (!USERNAME_PATTERN.test(slug)) {
      invalid++
      log('WARNING', 'usernames_backfill_invalid_slug', {
        uidPrefix: uid.slice(0, 8),
        slugPrefix: slug.slice(0, 4),
      })
      continue
    }

    const ref = usernameRef(db, slug)
    const existing = await ref.get()
    if (existing.exists) {
      const owner = String(existing.data()?.uid ?? '')
      if (owner === uid) {
        skipped++
      } else {
        log('WARNING', 'usernames_backfill_slug_conflict', {
          slugPrefix: slug.slice(0, 4),
          uidPrefix: uid.slice(0, 8),
          ownerPrefix: owner.slice(0, 8),
        })
        invalid++
      }
      continue
    }

    batch.set(ref, { uid, createdAt: Date.now() })
    ops++
    written++

    if (ops >= BATCH_SIZE) {
      await batch.commit()
      batch = db.batch()
      ops = 0
    }
  }

  if (ops > 0) await batch.commit()

  log('INFO', 'usernames_backfill_completed', {
    scanned,
    written,
    skipped,
    invalid,
  })
}

main().catch((e) => {
  log('CRITICAL', 'usernames_backfill_failed', {
    message: e instanceof Error ? e.message : 'unknown',
  })
  process.exit(1)
})
