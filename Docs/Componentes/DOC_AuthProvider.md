# DOC_AuthProvider

**Ficheiro:** [`components/auth/auth-provider.tsx`](../../components/auth/auth-provider.tsx)

- Contexto `AuthReadyContext`: `{ firebaseAuthReady }`.
- Sem Firebase configurado: `firebaseAuthReady` inicia `true`.
- Com Firebase: `onAuthStateChanged` → `setSession` / `logout`, `setCurrentUserId`, `ensureUserProfile`.
- `ensureUserProfile` está em **try/catch**: falha de rede ou regras Firestore não remove a sessão; regista `console.warn` com `uidPrefix` e mensagem de erro (sem tokens).
