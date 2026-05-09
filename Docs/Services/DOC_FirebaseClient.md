# DOC_FirebaseClient

**Ficheiro:** [`lib/firebase/client.ts`](../../lib/firebase/client.ts)  
**Diretiva:** `'use client'`

## Singletons de módulo

| Export | Comportamento |
|--------|---------------|
| `getFirebaseApp()` | `assertFirebasePublicConfig()`; `getApps()[0]` ou `initializeApp(cfg)` |
| `getFirebaseAuth()` | `getAuth(getFirebaseApp())` cacheado |
| `getFirestoreDb()` | `getFirestore(getFirebaseApp())` cacheado |

## Risco operacional

Chamar antes de `isFirebaseConfigured()` true dispara erro de assert — chamadores devem guardar primeiro.
