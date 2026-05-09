# DOC_FirebaseSession

**Ficheiro:** [`lib/auth/firebase-session.ts`](../../lib/auth/firebase-session.ts)

## `firebaseUserToSession(user: FirebaseUser): Promise<AuthSession>`

| Aspeto | Detalhe |
|--------|---------|
| Token | `await user.getIdToken()` → `accessToken` na sessão |
| Expiração | `getIdTokenResult()` → `expirationTime` → `expiresAt` ms |
| Utilizador | `id`, `email`, `displayName` (fallback email prefix ou `'Corredor'`) |
| refreshToken | Sempre `null` no modelo atual |

## Consumidores

- [`lib/auth/auth-service.ts`](../../lib/auth/auth-service.ts)
- [`components/auth/auth-provider.tsx`](../../components/auth/auth-provider.tsx)
