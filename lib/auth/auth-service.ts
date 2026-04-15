/**
 * Autenticação: Firebase (email/senha) quando NEXT_PUBLIC_FIREBASE_* estiver definido;
 * caso contrário, mock local para desenvolvimento sem projeto Firebase.
 */

import type { AuthSession } from './types'
import { AuthError } from './types'
import type {
  ForgotPasswordFormValues,
  LoginFormValues,
  SignupFormValues,
} from './schemas'
import { isFirebaseConfigured } from '@/lib/firebase/config'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Credenciais de demonstração — só quando Firebase não está configurado. */
const DEMO_EMAIL = 'demo@territory.run'
const DEMO_PASSWORD = 'demo123'

async function loginWithMock(credentials: LoginFormValues): Promise<AuthSession> {
  await delay(550)
  if (
    credentials.email.toLowerCase() === DEMO_EMAIL &&
    credentials.password === DEMO_PASSWORD
  ) {
    const expiresAt = Date.now() + 60 * 60 * 1000
    return {
      user: {
        id: 'user-demo',
        email: credentials.email,
        displayName: 'Demo TerritoryRun',
      },
      accessToken: `mock.${btoa(
        JSON.stringify({ sub: 'user-demo', exp: expiresAt }),
      )}`,
      refreshToken: null,
      expiresAt,
    }
  }
  throw new AuthError('E-mail ou senha incorretos.')
}

export async function login(
  credentials: LoginFormValues,
): Promise<AuthSession> {
  if (isFirebaseConfigured()) {
    const { signInWithEmailAndPassword } = await import('firebase/auth')
    const { getFirebaseAuth } = await import('@/lib/firebase/client')
    const { firebaseUserToSession } = await import('./firebase-session')
    try {
      const auth = getFirebaseAuth()
      const cred = await signInWithEmailAndPassword(
        auth,
        credentials.email.trim(),
        credentials.password,
      )
      return firebaseUserToSession(cred.user)
    } catch (e: unknown) {
      const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: string }).code) : ''
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        throw new AuthError('E-mail ou senha incorretos.')
      }
      if (code === 'auth/too-many-requests') {
        throw new AuthError('Muitas tentativas. Tente mais tarde.')
      }
      throw new AuthError('Não foi possível entrar. Tente novamente.')
    }
  }
  return loginWithMock(credentials)
}

export async function requestPasswordReset(
  data: ForgotPasswordFormValues,
): Promise<void> {
  if (isFirebaseConfigured()) {
    const { sendPasswordResetEmail } = await import('firebase/auth')
    const { getFirebaseAuth } = await import('@/lib/firebase/client')
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), data.email.trim())
    } catch {
      throw new AuthError('Não foi possível enviar o e-mail. Tente novamente.')
    }
    return
  }
  await delay(500)
  if (data.email.toLowerCase().includes('fail@')) {
    throw new AuthError('Não foi possível enviar o e-mail. Tente novamente.')
  }
}

/**
 * Registo com Firebase Auth + Firestore (perfil + username único).
 * Requer Firebase configurado.
 */
export async function registerWithFirebase(
  values: SignupFormValues,
): Promise<AuthSession> {
  if (!isFirebaseConfigured()) {
    throw new AuthError(
      'Configure o Firebase (.env.local) para criar uma conta.',
    )
  }

  const {
    createUserWithEmailAndPassword,
    updateProfile,
    deleteUser,
  } = await import('firebase/auth')
  const { getFirebaseAuth } = await import('@/lib/firebase/client')
  const { firebaseUserToSession } = await import('./firebase-session')
  const { createUserProfileAfterSignup } = await import(
    '@/lib/firebase/user-profile'
  )

  const auth = getFirebaseAuth()
  const email = values.email.trim().toLowerCase()
  const { confirmPassword: _, ...profile } = values

  let created: import('firebase/auth').User | null = null

  try {
    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      values.password,
    )
    created = cred.user
    await updateProfile(cred.user, {
      displayName: profile.nomeCompleto,
    })
    await createUserProfileAfterSignup(cred.user.uid, cred.user.email ?? email, {
      nomeCompleto: profile.nomeCompleto,
      usernameSlug: profile.username,
      dataNascimento: profile.dataNascimento,
      sexo: profile.sexo,
      peso: profile.peso,
      altura: profile.altura,
    })
    return firebaseUserToSession(cred.user)
  } catch (e: unknown) {
    if (created) {
      try {
        await deleteUser(created)
      } catch {
        /* ignore */
      }
    }
    const code =
      e && typeof e === 'object' && 'code' in e
        ? String((e as { code: string }).code)
        : ''
    if (code === 'auth/email-already-in-use') {
      throw new AuthError('Este e-mail já está registado.')
    }
    if (code === 'auth/weak-password') {
      throw new AuthError('Senha fraca. Use pelo menos 6 caracteres.')
    }
    if (code === 'auth/invalid-email') {
      throw new AuthError('E-mail inválido.')
    }
    const msg = e instanceof Error ? e.message : String(e)
    if (msg === 'USERNAME_TAKEN' || msg.includes('USERNAME_TAKEN')) {
      throw new AuthError(
        'Este nome de usuário já está em uso. Escolha outro.',
      )
    }
    throw new AuthError('Não foi possível criar a conta. Tente novamente.')
  }
}

/** Encerra sessão no Firebase (se aplicável). O estado local é limpo pela store. */
export async function signOutRemote(): Promise<void> {
  if (!isFirebaseConfigured()) return
  const { signOut } = await import('firebase/auth')
  const { getFirebaseAuth } = await import('@/lib/firebase/client')
  await signOut(getFirebaseAuth())
}
