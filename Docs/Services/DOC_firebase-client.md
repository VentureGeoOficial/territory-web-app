# DOC_firebase-client (`lib/firebase/client.ts`)

## Inicialização

- `getFirebaseApp`: `initializeApp` com Zod ou reutilização de app existente; erros registados uma vez (`console.error` com ISO, `[ERROR]`, `source`).
- `getFirestoreDb`: primeira chamada usa `initializeFirestore` + persistência IndexedDB multi‑tab; se lançar, fallback `getFirestore` + **`console.warn`** uma vez (`[WARN]`).

Sem segredos ou tokens nos logs.

## Imports

Todos os símbolos marcados `'use client'` — apenas bundle cliente.
