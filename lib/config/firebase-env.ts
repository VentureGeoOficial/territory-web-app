/**
 * Camada única de leitura das variáveis públicas do Firebase.
 *
 * Estas variáveis são incorporadas no bundle do cliente (prefixo `NEXT_PUBLIC_`)
 * e devem ser configuradas no painel da Vercel (ou em qualquer outro ambiente
 * compatível com Next.js). Não há, e não deve haver, leitura de ficheiros
 * `.env.local` em runtime — `process.env` já é populado por Next/Vercel.
 *
 * Validação com Zod garante mensagens de erro claras quando faltam variáveis
 * obrigatórias e mantém a tipagem coerente em todo o código.
 */
import { z } from 'zod'

const firebasePublicEnvSchema = z.object({
  apiKey: z.string().min(1),
  authDomain: z.string().min(1),
  projectId: z.string().min(1),
  appId: z.string().min(1),
  databaseURL: z.string().optional().default(''),
  storageBucket: z.string().optional().default(''),
  messagingSenderId: z.string().optional().default(''),
  measurementId: z.string().optional().default(''),
})

export type FirebasePublicConfig = z.infer<typeof firebasePublicEnvSchema>

function readRawPublicEnv() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ?? '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
  }
}

export function isFirebaseConfigured(): boolean {
  const raw = readRawPublicEnv()
  return firebasePublicEnvSchema.safeParse(raw).success
}

export function getFirebasePublicConfig(): FirebasePublicConfig {
  const raw = readRawPublicEnv()
  const parsed = firebasePublicEnvSchema.safeParse(raw)
  if (!parsed.success) {
    return raw as FirebasePublicConfig
  }
  return parsed.data
}

export function assertFirebasePublicConfig(): FirebasePublicConfig {
  const raw = readRawPublicEnv()
  const parsed = firebasePublicEnvSchema.safeParse(raw)
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((issue) => issue.path.join('.'))
      .join(', ')
    throw new Error(
      `Firebase não configurado. Variáveis ausentes ou inválidas: ${missing}. ` +
        'Defina os valores NEXT_PUBLIC_FIREBASE_* nas variáveis de ambiente (painel Vercel ou equivalente).',
    )
  }
  return parsed.data
}
