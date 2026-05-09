import 'server-only'

import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

import { getFirebaseAdminCredential } from '@/lib/config/firebase-admin-env'

let cachedApp: App | undefined

function initAdminApp(): App {
  if (cachedApp) return cachedApp

  const existing = getApps()[0]
  if (existing) {
    cachedApp = existing
    return cachedApp
  }

  const credential = getFirebaseAdminCredential()
  cachedApp = initializeApp({
    credential: cert({
      projectId: credential.projectId,
      clientEmail: credential.clientEmail,
      privateKey: credential.privateKey,
    }),
  })
  return cachedApp
}

export function getAdminFirestore() {
  return getFirestore(initAdminApp())
}

export function getAdminAuth() {
  return getAuth(initAdminApp())
}
