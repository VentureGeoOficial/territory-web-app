'use client'

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { assertFirebasePublicConfig } from '@/lib/config/firebase-env'

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const cfg = assertFirebasePublicConfig()
    app = getApps().length ? getApps()[0]! : initializeApp(cfg)
  }
  return app
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp())
  }
  return auth
}

export function getFirestoreDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp())
  }
  return db
}
