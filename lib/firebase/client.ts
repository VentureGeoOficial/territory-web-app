'use client'

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore'
import { assertFirebasePublicConfig } from '@/lib/config/firebase-env'

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined

let warnedFirestorePersistentFallback = false

function instantiateApp(): FirebaseApp {
  try {
    const cfg = assertFirebasePublicConfig()
    return getApps().length ? getApps()[0]! : initializeApp(cfg)
  } catch (e) {
    const ts = new Date().toISOString()
    console.error(`[${ts}] [ERROR] [getFirebaseApp] Falha ao inicializar app`, {
      source: 'lib/firebase/client.ts',
      detail: e instanceof Error ? e.message : String(e),
    })
    throw e
  }
}

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = instantiateApp()
  }
  return app
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp())
  }
  return auth
}

/**
 * Firestore singleton. Tenta primeiro cache persistente (IndexedDB, multi‑tab).
 * Se falhar (ex.: segunda inicialização ou ambiente estranho), usa `getFirestore` (memória).
 */
export function getFirestoreDb(): Firestore {
  if (!db) {
    const firebaseApp = getFirebaseApp()
    try {
      db = initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      })
    } catch (e) {
      const code =
        e && typeof e === 'object' && 'code' in e
          ? String((e as { code: string }).code)
          : ''
      if (!warnedFirestorePersistentFallback) {
        warnedFirestorePersistentFallback = true
        const ts = new Date().toISOString()
        console.warn(
          `[${ts}] [WARN] [getFirestoreDb] Persistência IndexedDB indisponível — fallback para Firestore default`,
          { source: 'lib/firebase/client.ts', code },
        )
      }
      db = getFirestore(firebaseApp)
    }
  }
  return db
}
