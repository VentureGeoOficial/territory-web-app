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
 * Verifica Bearer Id Token.
 *
 * `checkRevoked` default `true` — tokens revogados após logout noutro dispositivo
 * são rejeitados. Passe `checkRevoked: false` apenas se necessário (ex.: rotas
 * de leitura tolerantes a latência de revogação).
 */
export async function verifyAuthOrFail(
  req: Request,
  options: { checkRevoked?: boolean } = {},
): Promise<{ uid: string }> {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null
  if (!token) {
    throw new ApiAuthError('Token em falta.', 401)
  }
  const checkRevoked = options.checkRevoked !== false
  try {
    const decoded = await getAdminAuth().verifyIdToken(token, checkRevoked)
    return { uid: decoded.uid }
  } catch (e) {
    console.warn('[verifyAuthOrFail] verifyIdToken failed', {
      reason: e instanceof Error ? e.message : 'unknown',
      checkRevoked,
    })
    throw new ApiAuthError('Token inválido.', 401)
  }
}
