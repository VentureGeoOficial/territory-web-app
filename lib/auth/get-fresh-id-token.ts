import { getFirebaseAuth } from '@/lib/firebase/client'

/**
 * Obtém ID token Firebase atualizado (força refresh). Tokens expiram em ~1h;
 * sem `true`, o cache pode devolver token rejeitado pelo Admin SDK.
 */
export async function getFreshIdToken(): Promise<string | null> {
  const auth = getFirebaseAuth()
  const user = auth.currentUser
  if (!user) return null

  try {
    return await user.getIdToken(true)
  } catch {
    try {
      return await user.getIdToken(true)
    } catch {
      return null
    }
  }
}
