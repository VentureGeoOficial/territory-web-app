# DOC_FirebaseConfig

## Camada canónica

- [`lib/config/firebase-env.ts`](../../lib/config/firebase-env.ts) — leitura e validação Zod de `NEXT_PUBLIC_FIREBASE_*`.

## Re-export

- [`lib/firebase/config.ts`](../../lib/firebase/config.ts) reexporta `isFirebaseConfigured`, `getFirebasePublicConfig`, `assertFirebasePublicConfig`, tipo `FirebasePublicConfig`.

## Funções

| Função | Uso |
|--------|-----|
| `isFirebaseConfigured()` | Guard em UI e serviços |
| `getFirebasePublicConfig()` | Objeto config (permite strings vazias se parse falhar — compat.) |
| `assertFirebasePublicConfig()` | Usado por [`getFirebaseApp`](../../lib/firebase/client.ts); lança com lista de campos Zod |

## Admin (servidor)

Ver [DOC_FirebaseAdminApp.md](DOC_FirebaseAdminApp.md) e o módulo [`lib/config/firebase-admin-env.ts`](../../lib/config/firebase-admin-env.ts).
