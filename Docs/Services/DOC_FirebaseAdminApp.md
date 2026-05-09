# DOC_FirebaseAdminApp

**Ficheiro:** [`lib/firebase/admin-app.ts`](../../lib/firebase/admin-app.ts)  
**Diretivas:** `import 'server-only'`

## Inicialização

- `initAdminApp()` usa credencial de [`getFirebaseAdminCredential()`](../../lib/config/firebase-admin-env.ts) (`FIREBASE_SERVICE_ACCOUNT_JSON`).
- Reutiliza `getApps()[0]` se existir; caso contrário `initializeApp` com `cert(...)`.
- Cache em `cachedApp`.

## Exports

| Função | Retorno |
|--------|---------|
| `getAdminFirestore()` | Firestore Admin |
| `getAdminAuth()` | Auth Admin (`verifyIdToken` na API capture) |

## Consumidores

- [`lib/firebase/transactions.ts`](../../lib/firebase/transactions.ts)
- [`app/api/territories/capture/route.ts`](../../app/api/territories/capture/route.ts)
