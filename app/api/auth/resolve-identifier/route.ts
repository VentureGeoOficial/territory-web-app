import { NextResponse } from 'next/server'

import { getAdminFirestore } from '@/lib/firebase/admin-app'

/**
 * Pré-login: resolve username → email via Admin SDK (o cliente não pode ler `users` por email alheio).
 * Não regista o email em logs (enumeramento).
 */
export async function POST(req: Request) {
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
    // Alinhado a signupSchema (`lib/auth/schemas.ts`): slug até 30 caracteres.
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
      return NextResponse.json({ email: emailRaw })
    }

    const userBySlug = await db
      .collection('users')
      .where('username', '==', slug)
      .limit(1)
      .get()
    if (userBySlug.empty) {
      return NextResponse.json({ email: null })
    }

    const doc = userBySlug.docs[0]!
    const data = doc.data() as { email?: string }
    console.info(
      '[api/auth/resolve-identifier]',
      JSON.stringify({ lookup_source: 'users_username_fallback' }),
    )
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
    console.error('[api/auth/resolve-identifier]', e)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
