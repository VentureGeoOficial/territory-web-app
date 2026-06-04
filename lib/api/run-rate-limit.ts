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
 * Verifica intervalo mínimo entre finalizações (sem gravar).
 * Permite repetir tentativa se a anterior falhou.
 */
export async function checkRunRateLimit(uid: string): Promise<void> {
  const db = getAdminFirestore()
  const snap = await db.collection(RATE_LIMITS).doc(uid).get()
  const last = snap.exists
    ? Number((snap.data() as { lastRunCompleteAt?: number }).lastRunCompleteAt ?? 0)
    : 0
  const now = Date.now()
  if (now - last < MIN_INTERVAL_MS) {
    throw new RunRateLimitError()
  }
}

/**
 * Regista finalização bem-sucedida (corrida normal ou conquista).
 */
export async function recordRunRateLimit(uid: string): Promise<void> {
  const db = getAdminFirestore()
  const ref = db.collection(RATE_LIMITS).doc(uid)
  await ref.set({ lastRunCompleteAt: Date.now() }, { merge: true })
}

/** @deprecated Use checkRunRateLimit + recordRunRateLimit on success only. */
export async function assertRunRateLimit(uid: string): Promise<void> {
  await checkRunRateLimit(uid)
  await recordRunRateLimit(uid)
}
