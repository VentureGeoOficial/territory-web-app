import { NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase/admin-app'
import { FieldValue } from 'firebase-admin/firestore'
import { generateStableUserColor } from '@/lib/territory/geo'
import { LEGAL_VERSION } from '@/lib/app-info'

const USERS = 'users'
const USERNAMES = 'usernames'
const PUBLIC_PROFILES = 'publicProfiles'
const USERS_PRIVATE = 'usersPrivate'

interface CreateProfileRequest {
  idToken: string
  nomeCompleto: string
  usernameSlug: string
  dataNascimento: string
  sexo: 'male' | 'female' | 'other' | 'prefer_not'
  peso: number
  altura: number
  notificationPreferences?: {
    app: boolean
    email: boolean
    whatsapp: boolean
    frequency: 'realtime' | 'daily' | 'weekly'
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateProfileRequest
    const {
      idToken,
      nomeCompleto,
      usernameSlug,
      dataNascimento,
      sexo,
      peso,
      altura,
      notificationPreferences,
    } = body

    // Validar campos obrigatórios
    if (!idToken || !nomeCompleto || !usernameSlug || !dataNascimento || !sexo || !peso || !altura) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Validar formato do username
    if (!/^[a-z0-9_]{3,30}$/.test(usernameSlug)) {
      return NextResponse.json(
        { error: 'Username inválido. Use apenas letras minúsculas, números e underscore (3-30 caracteres)' },
        { status: 400 }
      )
    }

    // Verificar token e obter UID
    const auth = getAdminAuth()
    let decodedToken
    try {
      decodedToken = await auth.verifyIdToken(idToken)
    } catch {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    const uid = decodedToken.uid
    const email = decodedToken.email ?? ''

    const db = getAdminFirestore()
    const userRef = db.collection(USERS).doc(uid)
    const publicRef = db.collection(PUBLIC_PROFILES).doc(uid)
    const privateRef = db.collection(USERS_PRIVATE).doc(uid)
    const usernameRef = db.collection(USERNAMES).doc(usernameSlug)

    const color = generateStableUserColor(uid)

    // Executar transação com Admin SDK (ignora regras do Firestore)
    await db.runTransaction(async (trx) => {
      const usernameDoc = await trx.get(usernameRef)
      if (usernameDoc.exists) {
        throw new Error('USERNAME_TAKEN')
      }

      const defaultNotificationPrefs = notificationPreferences ?? {
        app: true,
        email: false,
        whatsapp: false,
        frequency: 'daily',
      }

      // Criar documento de username
      trx.set(usernameRef, {
        uid,
        createdAt: Date.now(),
      })

      // Criar perfil do usuário
      trx.set(userRef, {
        displayName: nomeCompleto,
        nomeCompleto,
        email: email.trim().toLowerCase(),
        username: usernameSlug,
        dataNascimento,
        sexo,
        peso,
        altura,
        notificationPreferences: defaultNotificationPrefs,
        legalAcceptance: {
          termsVersion: LEGAL_VERSION,
          privacyVersion: LEGAL_VERSION,
          acceptedAt: FieldValue.serverTimestamp(),
        },
        color,
        totalAreaM2: 0,
        territoriesCount: 0,
        xp: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })

      // Criar perfil público
      trx.set(publicRef, {
        displayName: nomeCompleto,
        username: usernameSlug,
        color,
        totalAreaM2: 0,
        territoriesCount: 0,
        xp: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })

      // Criar dados privados
      trx.set(privateRef, {
        email: email.trim().toLowerCase(),
        dataNascimento,
        sexo,
        peso,
        altura,
        notificationPreferences: defaultNotificationPrefs,
        legalAcceptance: {
          termsVersion: LEGAL_VERSION,
          privacyVersion: LEGAL_VERSION,
          acceptedAt: FieldValue.serverTimestamp(),
        },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    
    if (message === 'USERNAME_TAKEN') {
      return NextResponse.json(
        { error: 'USERNAME_TAKEN' },
        { status: 409 }
      )
    }

    console.error('[create-profile] Erro:', message)
    return NextResponse.json(
      { error: 'Erro ao criar perfil' },
      { status: 500 }
    )
  }
}
