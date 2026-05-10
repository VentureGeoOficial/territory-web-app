/**
 * Facade de configuração do Firebase no browser (Cliente).
 *
 * Fonte única de variáveis: `lib/config/firebase-env.ts`.
 * Implementação de app/auth/db: `./client`.
 */

export type { FirebasePublicConfig } from '@/lib/config/firebase-env'

export {
  getFirebaseApp,
  getFirebaseAuth,
  getFirestoreDb,
} from './client'
