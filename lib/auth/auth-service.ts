/**
 * Autenticação com Firebase (email/senha). Requer as variáveis NEXT_PUBLIC_FIREBASE_*
 * configuradas no ambiente (painel Vercel ou equivalente).
 */

import type { AuthSession } from './types'
import { AuthError } from './types'
import type {
  ForgotPasswordFormValues,
  LoginFormValues,
  SignupFormValues,
} from './schemas'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { log } from '@/lib/logging/logger'

export async function login(
  credentials: LoginFormValues,
): Promise<AuthSession> {
  if (!isFirebaseConfigured()) {
    throw new AuthError(
      'Firebase não está configurado. Defina as variáveis NEXT_PUBLIC_FIREBASE_* no ambiente.',
    )
  }
  const { signInWithEmailAndPassword } = await import('firebase/auth')
  const { getFirebaseAuth } = await import('@/lib/firebase/client')
  const { firebaseUserToSession } = await import('./firebase-session')

  const email = credentials.email.trim().toLowerCase()

  log.info({
    scope: 'auth',
    event: 'auth_login_started',
    emailDomain: email.split('@')[1] ?? 'unknown',
  })

  try {
    const auth = getFirebaseAuth()
    const cred = await signInWithEmailAndPassword(
      auth,
      email,
      credentials.password,
    )
    log.info({
      scope: 'auth',
      event: 'auth_login_succeeded',
      uid: cred.user.uid,
    })
    return firebaseUserToSession(cred.user)
  } catch (e: unknown) {
    if (e instanceof AuthError) throw e
    const code =
      e && typeof e === 'object' && 'code' in e
        ? String((e as { code: string }).code)
        : ''
    log.error({
      scope: 'auth',
      event: 'auth_login_failed',
      code: code || 'unknown',
    })
    if (
      code === 'auth/invalid-credential' ||
      code === 'auth/wrong-password' ||
      code === 'auth/user-not-found'
    ) {
      throw new AuthError('E-mail ou senha incorretos.')
    }
    if (code === 'auth/too-many-requests') {
      throw new AuthError('Muitas tentativas. Tente mais tarde.')
    }
    if (code === 'auth/invalid-email') {
      throw new AuthError('E-mail inválido.')
    }
    throw new AuthError('Não foi possível entrar. Tente novamente.')
  }
}

export async function requestPasswordReset(
  data: ForgotPasswordFormValues,
): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new AuthError(
      'Redefinição de senha requer Firebase configurado nas variáveis de ambiente.',
    )
  }
  const { sendPasswordResetEmail } = await import('firebase/auth')
  const { getFirebaseAuth } = await import('@/lib/firebase/client')
  const email = data.email.trim().toLowerCase()

  log.info({
    scope: 'auth',
    event: 'auth_password_reset_requested',
    emailDomain: email.split('@')[1] ?? 'unknown',
  })

  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email)
  } catch (e) {
    log.error({
      scope: 'auth',
      event: 'auth_password_reset_failed',
      message: e instanceof Error ? e.message : 'unknown',
    })
    throw new AuthError('Não foi possível enviar o e-mail. Tente novamente.')
  }
}

/**
 * Reenvia e-mail de verificação para o utilizador autenticado.
 */
export async function resendEmailVerification(): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new AuthError('Firebase não configurado.')
  }
  const { sendEmailVerification } = await import('firebase/auth')
  const { getFirebaseAuth } = await import('@/lib/firebase/client')
  const user = getFirebaseAuth().currentUser
  if (!user) {
    throw new AuthError('Sessão inválida. Entre novamente.')
  }
  if (user.emailVerified) return

  try {
    await sendEmailVerification(user)
    log.info({
      scope: 'auth',
      event: 'auth_email_verification_sent',
      uid: user.uid,
      resend: true,
    })
  } catch (e) {
    log.warn({
      scope: 'auth',
      event: 'auth_email_verification_failed',
      uid: user.uid,
      message: e instanceof Error ? e.message : 'unknown',
    })
    throw new AuthError(
      'Não foi possível reenviar o e-mail. Tente novamente em instantes.',
    )
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
      'Configure as variáveis Firebase no ambiente para criar uma conta.',
    )
  }

  const {
    createUserWithEmailAndPassword,
    updateProfile,
    deleteUser,
    sendEmailVerification,
  } = await import('firebase/auth')
  const { getFirebaseAuth } = await import('@/lib/firebase/client')
  const { firebaseUserToSession } = await import('./firebase-session')
  const { createUserProfileAfterSignup } = await import(
    '@/lib/firebase/user-profile'
  )

  const auth = getFirebaseAuth()
  const email = values.email.trim().toLowerCase()
  const { confirmPassword: _, ...profile } = values

  log.info({
    scope: 'auth',
    event: 'auth_signup_started',
    emailDomain: email.split('@')[1] ?? 'unknown',
  })

  let created: import('firebase/auth').User | null = null

  try {
    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      values.password,
    )
    created = cred.user

    try {
      await sendEmailVerification(cred.user)
      log.info({
        scope: 'auth',
        event: 'auth_email_verification_sent',
        uid: cred.user.uid,
      })
    } catch (e) {
      log.warn({
        scope: 'auth',
        event: 'auth_email_verification_failed',
        uid: cred.user.uid,
        message: e instanceof Error ? e.message : 'unknown',
      })
    }

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

    log.info({
      scope: 'auth',
      event: 'auth_signup_succeeded',
      uid: cred.user.uid,
    })

    return firebaseUserToSession(cred.user)
  } catch (e: unknown) {
    if (created) {
      try {
        await deleteUser(created)
      } catch (deleteErr) {
        log.critical({
          scope: 'auth',
          event: 'auth_signup_rollback_failed',
          uid: created.uid,
          message:
            deleteErr instanceof Error ? deleteErr.message : String(deleteErr),
        })
      }
    }
    const code =
      e && typeof e === 'object' && 'code' in e
        ? String((e as { code: string }).code)
        : ''
    log.error({
      scope: 'auth',
      event: 'auth_signup_failed',
      code: code || 'unknown',
    })
    if (code === 'auth/email-already-in-use') {
      throw new AuthError('Este e-mail já está registado.')
    }
    if (code === 'auth/weak-password') {
      throw new AuthError('Senha fraca. Use pelo menos 6 caracteres.')
    }
    if (code === 'auth/invalid-email') {
      throw new AuthError('E-mail inválido.')
    }
    if (code === 'auth/operation-not-allowed') {
      throw new AuthError(
        'O registo com e-mail e senha não está ativo no projeto Firebase. Ative "E-mail/senha" em Authentication → Sign-in method na consola.',
      )
    }
    if (code === 'auth/network-request-failed') {
      throw new AuthError(
        'Falha de rede ao contactar o Firebase. Verifique a ligação e tente novamente.',
      )
    }
    if (code === 'permission-denied') {
      throw new AuthError(
        'O servidor recusou gravar o perfil (Firestore). Confirme as Security Rules e redeploy. Se persistir, verifique o consola do navegador.',
      )
    }
    if (
      code === 'failed-precondition' ||
      code === 'aborted' ||
      code === 'unavailable' ||
      code === 'resource-exhausted'
    ) {
      throw new AuthError(
        'O servidor não conseguiu concluir o cadastro neste momento. Tente novamente dentro de alguns minutos.',
      )
    }
    const msg = e instanceof Error ? e.message : String(e)
    if (msg === 'USERNAME_TAKEN' || msg.includes('USERNAME_TAKEN')) {
      throw new AuthError(
        'Este nome de usuário já está em uso. Escolha outro.',
      )
    }
    if (msg === 'FIREBASE_NOT_CONFIGURED') {
      throw new AuthError(
        'Firebase não está configurado. Defina as variáveis NEXT_PUBLIC_FIREBASE_* no ambiente.',
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
  log.info({ scope: 'auth', event: 'auth_logout' })
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new AuthError('Troca de senha requer Firebase configurado.')
  }

  const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } =
    await import('firebase/auth')
  const { getFirebaseAuth } = await import('@/lib/firebase/client')
  const auth = getFirebaseAuth()
  const user = auth.currentUser
  if (!user || !user.email) {
    throw new AuthError('Sessão inválida. Entre novamente.')
  }

  try {
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)
    await updatePassword(user, newPassword)
  } catch {
    throw new AuthError(
      'Não foi possível alterar a senha. Verifique a senha atual e tente novamente.',
    )
  }
}

export async function deleteAccount(currentPassword: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new AuthError('Exclusão de conta requer Firebase configurado.')
  }
  const { EmailAuthProvider, reauthenticateWithCredential, deleteUser } =
    await import('firebase/auth')
  const { getFirebaseAuth, getFirestoreDb } = await import('@/lib/firebase/client')
  const { deleteDoc, doc } = await import('firebase/firestore')

  const auth = getFirebaseAuth()
  const user = auth.currentUser
  if (!user || !user.email) {
    throw new AuthError('Sessão inválida. Entre novamente.')
  }

  try {
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)
    const db = getFirestoreDb()
    await deleteDoc(doc(db, 'usersPrivate', user.uid))
    await deleteUser(user)
  } catch {
    throw new AuthError('Não foi possível excluir a conta. Tente novamente.')
  }
}
