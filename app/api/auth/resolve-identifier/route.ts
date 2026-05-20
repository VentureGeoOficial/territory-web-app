import { NextResponse } from 'next/server'

import { assertAuthRateLimit, AuthRateLimitError } from '@/lib/api/auth-rate-limit'
import { getAdminFirestore } from '@/lib/firebase/admin-app'
import { log } from '@/lib/logging/logger'

/**
 * Pré-login: resolve username → email via Admin SDK (o cliente não pode ler `users` por email alheio).
 * Não regista o email em logs (enumeramento).
 */
export async function POST(req: Request) {
  try {
    await assertAuthRateLimit(req)
  } catch (e) {
    if (e instanceof AuthRateLimitError) {
      log.warn({
        scope: 'auth_resolve_identifier',
        event: 'auth_resolve_identifier_rate_limited',
      })
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    throw e
  }

  try {
    let json: unknown
    try {
      json = await req.json()
    } catch {
      return NextResponse.json({ error: 'Corpo JSON inválido.' }, { status: 400 })
    }

    const body = json as { username?: string }
    const raw = typeof body.username === 'string' ? body.username.trim().toLowerCase() : ''
    const slug = raw.replace(/^@/, '')
    if (!slug || !/^[a-z0-9_]{3,30}$/.test(slug)) {
      return NextResponse.json({ error: 'Username inválido.' }, { status: 400 })
    }

    const db = getAdminFirestore()
    const usernameDoc = await db.collection('usernames').doc(slug).get()

    if (usernameDoc.exists) {
      const uid = String(usernameDoc.data()?.uid ?? '')
      if (!uid) {
        return NextResponse.json({ email: null })
      }
      const userSnap = await db.collection('users').doc(uid).get()
      const emailRaw =
        userSnap.exists && typeof (userSnap.data() as { email?: string }).email === 'string'
          ? String((userSnap.data() as { email: string }).email).trim().toLowerCase()
          : null
      log.info({
        scope: 'auth_resolve_identifier',
        event: 'auth_resolve_identifier_ok',
        lookupSource: 'usernames',
      })
      return NextResponse.json({ email: emailRaw })
    }

    const userBySlug = await db
      .collection('users')
      .where('username', '==', slug)
      .limit(1)
      .get()
    if (userBySlug.empty) {
      log.info({
        scope: 'auth_resolve_identifier',
        event: 'auth_resolve_identifier_not_found',
      })
      return NextResponse.json({ email: null })
    }

    const doc = userBySlug.docs[0]!
    const data = doc.data() as { email?: string }
    log.info({
      scope: 'auth_resolve_identifier',
      event: 'auth_resolve_identifier_ok',
      lookupSource: 'users_username_fallback',
    })
    const emailRaw =
      typeof data.email === 'string' ? data.email.trim().toLowerCase() : null

    return NextResponse.json({ email: emailRaw })
  } catch (e) {
    if (e instanceof Error && e.message.includes('FIREBASE_SERVICE_ACCOUNT')) {
      return NextResponse.json(
        { error: 'Servidor não configurado.' },
        { status: 503 },
      )
    }
    log.error({
      scope: 'auth_resolve_identifier',
      event: 'auth_resolve_identifier_error',
      message: e instanceof Error ? e.message : 'unknown',
    })
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
