# DOC_AuthProvider

**Ficheiro:** [`components/auth/auth-provider.tsx`](../../components/auth/auth-provider.tsx)

- Contexto `AuthReadyContext`: `{ firebaseAuthReady }`.
- Sem Firebase configurado: `firebaseAuthReady` inicia `true`.
- Com Firebase: `onAuthStateChanged` → `setSession` / `logout`, `setCurrentUserId`, `ensureUserProfile`.
