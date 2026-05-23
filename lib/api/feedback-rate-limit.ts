import 'server-only'

import { getAdminFirestore } from '@/lib/firebase/admin-app'

const RATE_LIMITS = 'rateLimits'
const WINDOW_MS = 60_000
const MAX_REQUESTS = 6

export class FeedbackRateLimitError extends Error {
  constructor() {
    super('Muitas tentativas. Aguarde um momento.')
    this.name = 'FeedbackRateLimitError'
  }
}

export async function assertFeedbackRateLimit(uid: string): Promise<void> {
  const key = `feedback_uid_${uid}`
  const db = getAdminFirestore()
  const ref = db.collection(RATE_LIMITS).doc(key)
  const now = Date.now()

  await db.runTransaction(async (trx) => {
    const snap = await trx.get(ref)
    const data = snap.data() as { windowStart?: number; count?: number } | undefined
    const windowStart = Number(data?.windowStart ?? 0)
    const count = Number(data?.count ?? 0)

    if (now - windowStart >= WINDOW_MS) {
      trx.set(ref, { windowStart: now, count: 1 }, { merge: true })
      return
    }

    if (count >= MAX_REQUESTS) {
      throw new FeedbackRateLimitError()
    }

    trx.set(ref, { windowStart, count: count + 1 }, { merge: true })
  })
}
