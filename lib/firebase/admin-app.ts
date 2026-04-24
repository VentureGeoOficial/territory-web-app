import 'server-only'

import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function initAdminApp() {
  const existing = getApps()[0]
  if (existing) return existing

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw?.trim()) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON não definido. Configure o JSON da conta de serviço no Vercel.',
    )
  }

  try {
    const parsed = JSON.parse(raw) as {
      project_id?: string
      client_email?: string
      private_key?: string
    }
    return initializeApp({
      credential: cert({
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key?.replace(/\\n/g, '\n'),
      }),
    })
  } catch (e) {
    throw new Error(
      `FIREBASE_SERVICE_ACCOUNT_JSON inválido: ${e instanceof Error ? e.message : String(e)}`,
    )
  }
}

export function getAdminFirestore() {
  return getFirestore(initAdminApp())
}

export function getAdminAuth() {
  return getAuth(initAdminApp())
}
