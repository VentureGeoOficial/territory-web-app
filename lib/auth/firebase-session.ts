import type { User as FirebaseUser } from 'firebase/auth'
import type { AuthSession } from './types'

export async function firebaseUserToSession(user: FirebaseUser): Promise<AuthSession> {
  const accessToken = await user.getIdToken()
  const result = await user.getIdTokenResult()
  const expiresAt = new Date(result.expirationTime).getTime()
  return {
    user: {
      id: user.uid,
      email: user.email ?? '',
      displayName:
        user.displayName?.trim() ||
        user.email?.split('@')[0] ||
        'Corredor',
    },
    accessToken,
    refreshToken: null,
    expiresAt,
  }
}
