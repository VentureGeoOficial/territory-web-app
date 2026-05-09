import 'server-only'

import { z } from 'zod'

/**
 * Leitura validada da credencial de serviço do Firebase Admin.
 *
 * O JSON completo da conta de serviço deve ser configurado em
 * `FIREBASE_SERVICE_ACCOUNT_JSON` (variável de ambiente apenas no servidor —
 * jamais com prefixo `NEXT_PUBLIC_`). Este módulo é `server-only`, garantindo
 * que o webpack falha o build se for importado a partir de código de cliente.
 */

const serviceAccountSchema = z.object({
  project_id: z.string().min(1),
  client_email: z.string().min(1),
  private_key: z.string().min(1),
})

export interface FirebaseAdminCredential {
  projectId: string
  clientEmail: string
  privateKey: string
}

export function getFirebaseAdminCredential(): FirebaseAdminCredential {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw?.trim()) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON não definido. Configure o JSON da conta de serviço nas variáveis de ambiente (painel Vercel).',
    )
  }

  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(raw)
  } catch (e) {
    throw new Error(
      `FIREBASE_SERVICE_ACCOUNT_JSON inválido (JSON malformado): ${
        e instanceof Error ? e.message : String(e)
      }`,
    )
  }

  const result = serviceAccountSchema.safeParse(parsedJson)
  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => issue.path.join('.'))
      .join(', ')
    throw new Error(
      `FIREBASE_SERVICE_ACCOUNT_JSON inválido. Campos obrigatórios em falta: ${missing}.`,
    )
  }

  return {
    projectId: result.data.project_id,
    clientEmail: result.data.client_email,
    privateKey: result.data.private_key.replace(/\\n/g, '\n'),
  }
}
