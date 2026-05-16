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
 * `checkRevoked` é OPCIONAL (default `false`). Em rotas críticas (mudar senha,
 * apagar conta) passe `true`; em rotas de leitura/escrita normais (lookup de
 * amigos, etc.) o default é suficiente — `verifyIdToken` já valida assinatura
 * e expiração contra as chaves públicas da Google. Manter `checkRevoked: true`
 * em todo o lado provocava 401s espúrios após mudanças de claim/sessão e
 * resultava no toast "Sessão expirada" em fluxos como Adicionar Amigos.
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
  const checkRevoked = options.checkRevoked === true
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
