# DOC_LoginForm

**Ficheiro:** [`components/auth/login-form.tsx`](../../components/auth/login-form.tsx)

- `react-hook-form` + `loginSchema` ([`lib/auth/schemas.ts`](../../lib/auth/schemas.ts)).
- `login()` / `loginWithGoogle()` de [`auth-service`](../../lib/auth/auth-service.ts).
- `useRateLimit` (1s min, 5/min).
- Botão submit e Google desabilitados se `!isFirebaseConfigured()`.
- Sucesso: `setSession` + `router.replace('/mapa')`.
