import { NextResponse } from 'next/server'

import { ApiAuthError, verifyAuthOrFail } from '@/lib/firebase/admin-auth'
import { getAdminFirestore } from '@/lib/firebase/admin-app'

/**
 * Utilizador autenticado: resolve email ou username → uid alvo (para pedidos de amizade).
 */
export async function POST(req: Request) {
  try {
    const { uid: callerUid } = await verifyAuthOrFail(req)

    let json: unknown
    try {
      json = await req.json()
    } catch {
      return NextResponse.json({ error: 'Corpo JSON inválido.' }, { status: 400 })
    }

    const body = json as { email?: string; username?: string }
    const emailRaw =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const usernameRaw =
      typeof body.username === 'string' ? body.username.trim().toLowerCase() : ''

    const hasEmail = emailRaw.length > 0
    const hasUsername = usernameRaw.length > 0
    if ((hasEmail && hasUsername) || (!hasEmail && !hasUsername)) {
      return NextResponse.json(
        { error: 'Envie apenas email ou apenas username.' },
        { status: 400 },
      )
    }

    const db = getAdminFirestore()

    if (hasEmail) {
      const snap = await db
        .collection('users')
        .where('email', '==', emailRaw)
        .limit(1)
        .get()
      if (snap.empty) {
        return NextResponse.json({ uid: null })
      }
      const target = snap.docs[0]!.id
      if (target === callerUid) {
        return NextResponse.json({ uid: null })
      }
      return NextResponse.json({ uid: target })
    }

    const slug = usernameRaw.replace(/^@/, '')
    if (!/^[a-z0-9_]{3,30}$/.test(slug)) {
      return NextResponse.json({ error: 'Username inválido.' }, { status: 400 })
    }

    const doc = await db.collection('usernames').doc(slug).get()
    if (!doc.exists) {
      return NextResponse.json({ uid: null })
    }
    const target = String(doc.data()?.uid ?? '')
    if (!target || target === callerUid) {
      return NextResponse.json({ uid: null })
    }
    return NextResponse.json({ uid: target })
  } catch (e) {
    if (e instanceof ApiAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    if (e instanceof Error && e.message.includes('FIREBASE_SERVICE_ACCOUNT')) {
      return NextResponse.json(
        { error: 'Servidor não configurado.' },
        { status: 503 },
      )
    }
    console.error('[api/friends/lookup]', e)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
