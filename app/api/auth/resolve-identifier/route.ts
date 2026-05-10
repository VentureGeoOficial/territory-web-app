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
    if (!slug || !/^[a-z0-9_]{3,20}$/.test(slug)) {
      return NextResponse.json({ error: 'Username inválido.' }, { status: 400 })
    }

    const db = getAdminFirestore()
    const snap = await db.collection('usernames').doc(slug).get()
    if (!snap.exists) {
      return NextResponse.json({ email: null })
    }

    const uid = String(snap.data()?.uid ?? '')
    if (!uid) {
      return NextResponse.json({ email: null })
    }

    const userSnap = await db.collection('users').doc(uid).get()
    const emailRaw =
      userSnap.exists && typeof (userSnap.data() as { email?: string }).email === 'string'
        ? String((userSnap.data() as { email: string }).email).trim().toLowerCase()
        : null

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
