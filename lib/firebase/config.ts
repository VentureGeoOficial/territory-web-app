/**
 * Re-exporta a camada única de configuração do Firebase para preservar a API
 * usada em todo o projeto (`isFirebaseConfigured`, `getFirebasePublicConfig`).
 *
 * A leitura efetiva de variáveis de ambiente está em `lib/config/firebase-env.ts`.
 */
export {
  isFirebaseConfigured,
  getFirebasePublicConfig,
  assertFirebasePublicConfig,
  type FirebasePublicConfig,
} from '@/lib/config/firebase-env'
