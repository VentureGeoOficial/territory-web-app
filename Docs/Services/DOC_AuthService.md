# DOC_AuthService

**Ficheiro:** [`lib/auth/auth-service.ts`](../../lib/auth/auth-service.ts)

## Dependências

- `isFirebaseConfigured` — [`lib/firebase/config`](../../lib/firebase/config.ts)
- Imports dinâmicos de `firebase/auth`, `@/lib/firebase/client`, `@/lib/firebase/user-profile`

## Funções exportadas

| Função | Parâmetros | Retorno | Comportamento |
|--------|------------|---------|---------------|
| `login` | `LoginFormValues` | `AuthSession` | Resolve email por username via `POST /api/auth/resolve-identifier` ou deteção de e-mail; `signInWithEmailAndPassword` com **fallback**: segunda tentativa com `password.trim()` só após falhas `auth/invalid-credential` \| `wrong-password` \| `user-not-found` quando há espaços extra (autofill/paste). Logs `console.error` com `code` Firebase em falha; `console.warn` se recuperou via trim. Ver [`SEC_AuthFlows.md`](../Seguranca/SEC_AuthFlows.md). |
| `loginWithGoogle` | — | `AuthSession` | `GoogleAuthProvider` + `signInWithPopup` |
| `requestPasswordReset` | `ForgotPasswordFormValues` | `void` | `sendPasswordResetEmail` |
| `registerWithFirebase` | `SignupFormValues` | `AuthSession` | Email `trim().toLowerCase()`; senha: usa `password.trim()` quando `trim().length >= 6`, senão mantém valor original (respeita validação Zod). `createUserWithEmailAndPassword`, `updateProfile`, `createUserProfileAfterSignup`; rollback `deleteUser` em falha |
| `signOutRemote` | — | `void` | `signOut` se Firebase configurado |
| `changePassword` | `currentPassword`, `newPassword` | `void` | Reauth `EmailAuthProvider` + `updatePassword` |
| `deleteAccount` | `currentPassword` | `void` | Reauth; `deleteDoc(usersPrivate)`; `deleteUser` |

## Erros

Classe `AuthError` em [`lib/auth/types.ts`](../../lib/auth/types.ts).

Matriz código Firebase → mensagem ao utilizador (`login`): ver secção **Mensagens ao utilizador vs código Firebase** em [`Docs/Seguranca/SEC_AuthFlows.md`](../Seguranca/SEC_AuthFlows.md).

## Chamadores típicos

- [`components/auth/login-form.tsx`](../../components/auth/login-form.tsx)
- [`components/auth/signup-form.tsx`](../../components/auth/signup-form.tsx)
- [`components/auth/forgot-password-form.tsx`](../../components/auth/forgot-password-form.tsx)
- Páginas conta/segurança/excluir
