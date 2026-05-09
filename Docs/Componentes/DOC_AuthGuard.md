# DOC_AuthGuard

**Ficheiro:** [`components/auth/auth-guard.tsx`](../../components/auth/auth-guard.tsx)

- Aguarda hidratação Zustand persist (`onFinishHydration`).
- Requer `firebaseAuthReady` e `selectIsAuthenticated`.
- Se não autenticado após pronto → `router.replace('/login')`.
- Loading: `Spinner` fullscreen.
