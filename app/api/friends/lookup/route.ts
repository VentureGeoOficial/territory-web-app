import { NextResponse } from 'next/server'

import { ApiAuthError, verifyAuthOrFail } from '@/lib/firebase/admin-auth'
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin-app'

function isAuthUserNotFound(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code?: string }).code === 'auth/user-not-found'
  )
}

async function resolveUidFromUsernameSlug(
  db: ReturnType<typeof getAdminFirestore>,
  slug: string,
  callerUid: string,
): Promise<string | null> {
  const usernameDoc = await db.collection('usernames').doc(slug).get()
  if (usernameDoc.exists) {
    const target = String(usernameDoc.data()?.uid ?? '')
    if (!target || target === callerUid) return null
    return target
  }

  const userSnap = await db
    .collection('users')
    .where('username', '==', slug)
    .limit(1)
    .get()
  if (userSnap.empty) return null
  const target = userSnap.docs[0]!.id
  if (target === callerUid) return null
  console.info(
    '[api/friends/lookup]',
    JSON.stringify({
      component: 'FriendsLookup',
      lookup_source: 'users_username_fallback',
      callerUidPrefix: callerUid.slice(0, 8),
    }),
  )
  return target
}

async function resolveUidByEmailAuth(
  emailRaw: string,
  callerUid: string,
): Promise<string | null> {
  try {
    const userRecord = await getAdminAuth().getUserByEmail(emailRaw)
    if (userRecord.uid === callerUid) return null
    console.info(
      '[api/friends/lookup]',
      JSON.stringify({
        component: 'FriendsLookup',
        lookup_source: 'auth_fallback',
        callerUidPrefix: callerUid.slice(0, 8),
      }),
    )
    return userRecord.uid
  } catch (e: unknown) {
    if (isAuthUserNotFound(e)) return null
    throw e
  }
}

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
        const fromAuth = await resolveUidByEmailAuth(emailRaw, callerUid)
        return NextResponse.json({ uid: fromAuth })
      }
      const target = snap.docs[0]!.id
      if (target === callerUid) {
        return NextResponse.json({ uid: null })
      }
      return NextResponse.json({ uid: target })
    }

    const slug = usernameRaw.replace(/^@/, '')
    // Alinhado com firestore.rules (usernames), lib/auth/schemas.ts,
    // app/api/auth/create-profile e app/api/auth/resolve-identifier.
    // Antes estava `{3,20}` — bloqueava lookup de utilizadores com username 21–30 chars.
    if (!/^[a-z0-9_]{3,30}$/.test(slug)) {
      return NextResponse.json({ error: 'Username inválido.' }, { status: 400 })
    }

    const targetUid = await resolveUidFromUsernameSlug(db, slug, callerUid)
    if (!targetUid) {
      return NextResponse.json({ uid: null })
    }
    return NextResponse.json({ uid: targetUid })
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
