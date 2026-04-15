import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from 'firebase/firestore'
import { getFirestoreDb } from './client'
import { isFirebaseConfigured } from './config'
import { generateStableUserColor } from '@/lib/territory/geo'

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
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

const USERS = 'users'
const USERNAMES = 'usernames'

export interface SignupProfilePayload {
  nomeCompleto: string
  usernameSlug: string
  dataNascimento: string
  sexo: Sexo
  peso: number
  altura: number
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
      color,
      totalAreaM2: 0,
      territoriesCount: 0,
      xp: 0,
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
