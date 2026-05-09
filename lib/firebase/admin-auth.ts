import 'server-only'

import { getAdminAuth } from '@/lib/firebase/admin-app'

export class ApiAuthError extends Error {
  constructor(
    message: string,
    readonly status: number = 401,
  ) {
    super(message)
    this.name = 'ApiAuthError'
  }
}

/**
 * Verifica Bearer Id Token com revogação ativa (`checkRevoked: true`).
 * Usado por rotas API server-side (Next.js / Vercel).
 */
export async function verifyAuthOrFail(req: Request): Promise<{ uid: string }> {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null
  if (!token) {
    throw new ApiAuthError('Token em falta.', 401)
  }
  try {
    const decoded = await getAdminAuth().verifyIdToken(token, true)
    return { uid: decoded.uid }
  } catch (e) {
    console.warn('[verifyAuthOrFail] verifyIdToken failed', {
      reason: e instanceof Error ? e.message : 'unknown',
    })
    throw new ApiAuthError('Token inválido.', 401)
  }
}
