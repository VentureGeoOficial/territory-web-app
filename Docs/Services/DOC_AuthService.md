# DOC_AuthService

**Ficheiro:** [`lib/auth/auth-service.ts`](../../lib/auth/auth-service.ts)

## Dependências

- `isFirebaseConfigured` — [`lib/firebase/config`](../../lib/firebase/config.ts)
- Imports dinâmicos de `firebase/auth`, `@/lib/firebase/client`, `@/lib/firebase/user-profile`

## Funções exportadas

| Função | Parâmetros | Retorno | Comportamento |
|--------|------------|---------|---------------|
| `login` | `LoginFormValues` | `AuthSession` | Resolve email por username via `POST /api/auth/resolve-identifier` ou regex email; `signInWithEmailAndPassword`; mapeia códigos Firebase para `AuthError` |
| `loginWithGoogle` | — | `AuthSession` | `GoogleAuthProvider` + `signInWithPopup` |
| `requestPasswordReset` | `ForgotPasswordFormValues` | `void` | `sendPasswordResetEmail` |
| `registerWithFirebase` | `SignupFormValues` | `AuthSession` | `createUserWithEmailAndPassword`, `updateProfile`, `createUserProfileAfterSignup`; rollback `deleteUser` em falha |
| `signOutRemote` | — | `void` | `signOut` se Firebase configurado |
| `changePassword` | `currentPassword`, `newPassword` | `void` | Reauth `EmailAuthProvider` + `updatePassword` |
| `deleteAccount` | `currentPassword` | `void` | Reauth; `deleteDoc(usersPrivate)`; `deleteUser` |

## Erros

Classe `AuthError` em [`lib/auth/types.ts`](../../lib/auth/types.ts).

## Chamadores típicos

- [`components/auth/login-form.tsx`](../../components/auth/login-form.tsx)
- [`components/auth/signup-form.tsx`](../../components/auth/signup-form.tsx)
- [`components/auth/forgot-password-form.tsx`](../../components/auth/forgot-password-form.tsx)
- Páginas conta/segurança/excluir
