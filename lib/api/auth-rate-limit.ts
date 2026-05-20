import 'server-only'

import { createHash } from 'node:crypto'

import { getAdminFirestore } from '@/lib/firebase/admin-app'

const RATE_LIMITS = 'rateLimits'
const WINDOW_MS = 60_000
const MAX_REQUESTS = 10

export class AuthRateLimitError extends Error {
  constructor() {
    super('Muitas tentativas. Aguarde um momento.')
    this.name = 'AuthRateLimitError'
  }
}

function clientKeyFromRequest(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip =
    (forwarded?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown') ??
    'unknown'
  return createHash('sha256').update(ip).digest('hex').slice(0, 32)
}

/**
 * Rate-limit por IP para rotas auth públicas (ex.: resolve-identifier).
 * 10 pedidos por minuto por IP.
 */
export async function assertAuthRateLimit(req: Request): Promise<void> {
  const key = `auth_ip_${clientKeyFromRequest(req)}`
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
      throw new AuthRateLimitError()
    }

    trx.set(ref, { windowStart, count: count + 1 }, { merge: true })
  })
}
