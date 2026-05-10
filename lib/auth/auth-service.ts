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

/** Domínios multi-segmento (ex.: .co.uk, .com.br) não devem ser tratados como username. */
function identifierLooksLikeEmail(identifier: string): boolean {
  const atCount = (identifier.match(/@/g) ?? []).length
  return atCount === 1 && identifier.split('@')[0]!.trim().length > 0
}

async function resolveEmailFromUsernameForLogin(
  username: string,
): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/resolve-identifier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { email?: string | null }
    const em = data.email
    return typeof em === 'string' && em.length > 0 ? em.trim().toLowerCase() : null
  } catch {
    return null
  }
}

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
  try {
    const auth = getFirebaseAuth()
    const identifier = credentials.identifier.trim().toLowerCase()
    const atCount = (identifier.match(/@/g) ?? []).length
    if (atCount > 1) {
      throw new AuthError('Identificador inválido.')
    }
    let resolvedEmail: string | null = null
    if (identifierLooksLikeEmail(identifier)) {
      resolvedEmail = identifier
    } else {
      resolvedEmail = await resolveEmailFromUsernameForLogin(identifier)
    }
    if (!resolvedEmail) {
      throw new AuthError('Usuário não encontrado.')
    }
    // 1ª tentativa com senha literal (compatível com senhas que incluem espaços intencionais).
    let cred
    try {
      cred = await signInWithEmailAndPassword(
        auth,
        resolvedEmail,
        credentials.password,
      )
    } catch (firstErr: unknown) {
      const firstCode =
        firstErr && typeof firstErr === 'object' && 'code' in firstErr
          ? String((firstErr as { code: string }).code)
          : ''
      const trimmedPwd = credentials.password.trim()
      // Re-tenta só em falhas típicas de credencial e quando há espaços extra (autofill / paste).
      if (
        (firstCode === 'auth/invalid-credential' ||
          firstCode === 'auth/wrong-password' ||
          firstCode === 'auth/user-not-found') &&
        trimmedPwd !== credentials.password &&
        trimmedPwd.length > 0
      ) {
        cred = await signInWithEmailAndPassword(
          auth,
          resolvedEmail,
          trimmedPwd,
        )
        const ts = new Date().toISOString()
        console.warn(
          `[${ts}] [WARN] [login] Login recuperado após trim da senha`,
          JSON.stringify({
            component: 'AuthService',
            source: 'lib/auth/auth-service.ts',
            functionality: 'login',
            recovered_with: 'password_trim',
          }),
        )
      } else {
        throw firstErr
      }
    }
    return firebaseUserToSession(cred.user)
  } catch (e: unknown) {
    // Propaga erros de validação/resolução sem sobrescrever a mensagem.
    if (e instanceof AuthError) throw e
    const code =
      e && typeof e === 'object' && 'code' in e
        ? String((e as { code: string }).code)
        : ''
    const ts = new Date().toISOString()
    console.error(
      `[${ts}] [ERROR] [login] Falha na autenticação`,
      JSON.stringify({
        component: 'AuthService',
        source: 'lib/auth/auth-service.ts',
        functionality: 'login',
        code: code || 'unknown',
      }),
    )
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

export async function loginWithGoogle(): Promise<AuthSession> {
  if (!isFirebaseConfigured()) {
    throw new AuthError('Login social disponível apenas com Firebase configurado.')
  }
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
  const { getFirebaseAuth } = await import('@/lib/firebase/client')
  const { firebaseUserToSession } = await import('./firebase-session')

  try {
    const provider = new GoogleAuthProvider()
    const auth = getFirebaseAuth()
    const cred = await signInWithPopup(auth, provider)
    return firebaseUserToSession(cred.user)
  } catch (e: unknown) {
    const code =
      e && typeof e === 'object' && 'code' in e
        ? String((e as { code: string }).code)
        : ''
    const ts = new Date().toISOString()
    console.error(
      `[${ts}] [ERROR] [loginWithGoogle] Falha no login social`,
      JSON.stringify({
        component: 'AuthService',
        source: 'lib/auth/auth-service.ts',
        functionality: 'loginWithGoogle',
        code: code || 'unknown',
      }),
    )
    throw new AuthError('Não foi possível entrar com Google. Tente novamente.')
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
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), data.email.trim())
  } catch {
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
      'Configure as variáveis Firebase no ambiente para criar uma conta.',
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
  // Remove espaços acidentais na senha só quando o trim mantém regra mínima (Zod min 6).
  const pwdTrimmed = values.password.trim()
  const passwordForAuth =
    pwdTrimmed.length >= 6 ? pwdTrimmed : values.password

  let created: import('firebase/auth').User | null = null

  try {
    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      passwordForAuth,
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
    const ts = new Date().toISOString()
    if (code) {
      console.error(
        `[${ts}] [ERROR] [registerWithFirebase] Falha no cadastro`,
        { source: 'lib/auth/auth-service.ts', code },
      )
    } else {
      console.error(
        `[${ts}] [ERROR] [registerWithFirebase] Falha no cadastro (sem código)`,
        { source: 'lib/auth/auth-service.ts' },
      )
    }
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
