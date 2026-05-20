import 'server-only'

import { getAdminFirestore } from '@/lib/firebase/admin-app'

const RATE_LIMITS = 'rateLimits'
const MIN_INTERVAL_MS = 60_000

export class RunRateLimitError extends Error {
  constructor() {
    super('Aguarde um momento antes de finalizar outra corrida.')
    this.name = 'RunRateLimitError'
  }
}

/**
 * Limita finalização de corrida: 1 por uid a cada 60 s (Firestore, compatível serverless).
 */
export async function assertRunRateLimit(uid: string): Promise<void> {
  const db = getAdminFirestore()
  const ref = db.collection(RATE_LIMITS).doc(uid)
  const now = Date.now()

  await db.runTransaction(async (trx) => {
    const snap = await trx.get(ref)
    const last = snap.exists
      ? Number((snap.data() as { lastRunCompleteAt?: number }).lastRunCompleteAt ?? 0)
      : 0
    if (now - last < MIN_INTERVAL_MS) {
      throw new RunRateLimitError()
    }
    trx.set(ref, { lastRunCompleteAt: now }, { merge: true })
  })
}
