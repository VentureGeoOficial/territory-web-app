import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore'
import { getFirestoreDb } from './client'
import { isFirebaseConfigured } from './config'
import { generateStableUserColor } from '@/lib/territory/geo'
import type { NotificationPreferencesValues } from '@/lib/auth/schemas'
import { LEGAL_VERSION } from '@/lib/app-info'

export type Sexo = 'male' | 'female' | 'other' | 'prefer_not'

export interface UserProfileDoc {
  displayName: string
  email: string
  color: string
  totalAreaM2: number
  territoriesCount: number
  xp: number
  /** Nome completo (cadastro) */
  nomeCompleto?: string
  /** Slug único normalizado */
  username?: string
  /** ISO date YYYY-MM-DD */
  dataNascimento?: string
  sexo?: Sexo
  peso?: number
  altura?: number
  cpf?: string
  avatarUrl?: string
  backgroundUrl?: string
  notificationPreferences?: NotificationPreferencesValues
  legalAcceptance?: {
    termsVersion: string
    privacyVersion: string
    acceptedAt?: Timestamp
  }
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

const USERS = 'users'
const USERNAMES = 'usernames'
const PUBLIC_PROFILES = 'publicProfiles'
const USERS_PRIVATE = 'usersPrivate'

export interface SignupProfilePayload {
  nomeCompleto: string
  usernameSlug: string
  dataNascimento: string
  sexo: Sexo
  peso: number
  altura: number
  notificationPreferences?: NotificationPreferencesValues
}

/**
 * Cria `users/{uid}` e `usernames/{slug}` na mesma transação.
 * Lança se o username já estiver em uso.
 */
export async function createUserProfileAfterSignup(
  uid: string,
  email: string,
  data: SignupProfilePayload,
): Promise<void> {
  if (!isFirebaseConfigured()) return
  const db = getFirestoreDb()
  const userRef = doc(db, USERS, uid)
  const publicRef = doc(db, PUBLIC_PROFILES, uid)
  const privateRef = doc(db, USERS_PRIVATE, uid)
  const usernameRef = doc(db, USERNAMES, data.usernameSlug)
  const color = generateStableUserColor(uid)

  await runTransaction(db, async (trx) => {
    const taken = await trx.get(usernameRef)
    if (taken.exists()) {
      throw new Error('USERNAME_TAKEN')
    }
    trx.set(usernameRef, {
      uid,
      createdAt: serverTimestamp(),
    })
    trx.set(userRef, {
      displayName: data.nomeCompleto,
      nomeCompleto: data.nomeCompleto,
      email: email.trim().toLowerCase(),
      username: data.usernameSlug,
      dataNascimento: data.dataNascimento,
      sexo: data.sexo,
      peso: data.peso,
      altura: data.altura,
      notificationPreferences: data.notificationPreferences ?? {
        app: true,
        email: false,
        whatsapp: false,
        frequency: 'daily',
      },
      legalAcceptance: {
        termsVersion: LEGAL_VERSION,
        privacyVersion: LEGAL_VERSION,
        acceptedAt: serverTimestamp(),
      },
      color,
      totalAreaM2: 0,
      territoriesCount: 0,
      xp: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    trx.set(publicRef, {
      displayName: data.nomeCompleto,
      username: data.usernameSlug,
      color,
      totalAreaM2: 0,
      territoriesCount: 0,
      xp: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    trx.set(privateRef, {
      email: email.trim().toLowerCase(),
      dataNascimento: data.dataNascimento,
      sexo: data.sexo,
      peso: data.peso,
      altura: data.altura,
      notificationPreferences: data.notificationPreferences ?? {
        app: true,
        email: false,
        whatsapp: false,
        frequency: 'daily',
      },
      legalAcceptance: {
        termsVersion: LEGAL_VERSION,
        privacyVersion: LEGAL_VERSION,
        acceptedAt: serverTimestamp(),
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })
}

export async function ensureUserProfile(
  uid: string,
  info: { email: string; displayName: string },
): Promise<void> {
  if (!isFirebaseConfigured()) return
  const db = getFirestoreDb()
  const ref = doc(db, USERS, uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return
  const color = generateStableUserColor(uid)
  await setDoc(ref, {
    displayName: info.displayName,
    email: info.email.trim().toLowerCase(),
    color,
    totalAreaM2: 0,
    territoriesCount: 0,
    xp: 0,
    notificationPreferences: {
      app: true,
      email: false,
      whatsapp: false,
      frequency: 'daily',
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await setDoc(doc(db, PUBLIC_PROFILES, uid), {
    displayName: info.displayName,
    color,
    totalAreaM2: 0,
    territoriesCount: 0,
    xp: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await setDoc(doc(db, USERS_PRIVATE, uid), {
    email: info.email.trim().toLowerCase(),
    notificationPreferences: {
      app: true,
      email: false,
      whatsapp: false,
      frequency: 'daily',
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function getUserProfile(uid: string): Promise<UserProfileDoc | null> {
  if (!isFirebaseConfigured()) return null
  const snap = await getDoc(doc(getFirestoreDb(), USERS, uid))
  if (!snap.exists()) return null
  return snap.data() as UserProfileDoc
}

type UserProfileUpdatableFields = Pick<
  UserProfileDoc,
  | 'displayName'
  | 'nomeCompleto'
  | 'username'
  | 'dataNascimento'
  | 'sexo'
  | 'peso'
  | 'altura'
  | 'avatarUrl'
  | 'backgroundUrl'
>

export async function updateUserProfile(
  uid: string,
  payload: UserProfileUpdatableFields,
): Promise<void> {
  if (!isFirebaseConfigured()) return
  await updateDoc(doc(getFirestoreDb(), USERS, uid), {
    ...payload,
    updatedAt: serverTimestamp(),
  })
  await updateDoc(doc(getFirestoreDb(), PUBLIC_PROFILES, uid), {
    displayName: payload.displayName,
    username: payload.username,
    updatedAt: serverTimestamp(),
  })
  await updateDoc(doc(getFirestoreDb(), USERS_PRIVATE, uid), {
    dataNascimento: payload.dataNascimento,
    sexo: payload.sexo,
    peso: payload.peso,
    altura: payload.altura,
    updatedAt: serverTimestamp(),
  })
}

export async function updateNotificationPreferences(
  uid: string,
  preferences: NotificationPreferencesValues,
): Promise<void> {
  if (!isFirebaseConfigured()) return
  await updateDoc(doc(getFirestoreDb(), USERS, uid), {
    notificationPreferences: preferences,
    updatedAt: serverTimestamp(),
  })
  await updateDoc(doc(getFirestoreDb(), USERS_PRIVATE, uid), {
    notificationPreferences: preferences,
    updatedAt: serverTimestamp(),
  })
}

export async function recordLegalAcceptance(uid: string): Promise<void> {
  if (!isFirebaseConfigured()) return
  await updateDoc(doc(getFirestoreDb(), USERS, uid), {
    legalAcceptance: {
      termsVersion: LEGAL_VERSION,
      privacyVersion: LEGAL_VERSION,
      acceptedAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  })
  await updateDoc(doc(getFirestoreDb(), USERS_PRIVATE, uid), {
    legalAcceptance: {
      termsVersion: LEGAL_VERSION,
      privacyVersion: LEGAL_VERSION,
      acceptedAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  })
}
