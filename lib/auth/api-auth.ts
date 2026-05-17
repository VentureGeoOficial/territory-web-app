import { getFreshIdToken } from '@/lib/auth/get-fresh-id-token'

export class ApiAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiAuthError'
  }
}

/**
 * Headers para APIs Next.js autenticadas com Firebase ID token (sempre renovado).
 */
export async function getApiAuthHeaders(): Promise<HeadersInit> {
  const token = await getFreshIdToken()
  if (!token) {
    throw new ApiAuthError('Inicie sessão novamente.')
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}
