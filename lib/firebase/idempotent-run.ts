import 'server-only'

import { getAdminFirestore } from '@/lib/firebase/admin-app'

const RUNS = 'runs'

/** Se a corrida já foi persistida com este `runId`, devolve o resultado anterior. */
export async function getIdempotentRunResult(
  runId: string,
): Promise<{ territoryId: string; runId: string } | null> {
  const snap = await getAdminFirestore().collection(RUNS).doc(runId).get()
  if (!snap.exists) return null
  const data = snap.data() as { territoryId?: string } | undefined
  const territoryId = data?.territoryId
  if (!territoryId || typeof territoryId !== 'string') return null
  return { territoryId, runId }
}
