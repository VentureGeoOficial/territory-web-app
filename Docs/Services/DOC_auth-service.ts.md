# DOC_auth-service.ts

**Ficheiro:** [`lib/auth/auth-service.ts`](../../lib/auth/auth-service.ts)

## Logs

| Contexto | Nível | Dados registados |
|----------|-------|------------------|
| Falha genérica em `registerWithFirebase` | `console.error` | `timestamp ISO`, `[ERROR]`, funcionalidade, `source`, `code` Firebase/Firestore (quando existe) |
| Falha sem `code` no `catch` de registo | `console.error` | idem sem `code` |
| Falha em `login` após excepção Firebase | `console.error` | `[login] Falha na autenticação`, JSON com `component`, `source`, `functionality`, `code` (Firebase ou `unknown`) |
| Falha em `loginWithGoogle` | `console.error` | `[loginWithGoogle] Falha no login social`, mesmo formato JSON |
| Sucesso em `login` na 2ª tentativa após `password.trim()` | `console.warn` | `[login] Login recuperado após trim da senha`, JSON com `recovered_with: password_trim` |

**Segurança:** não registar e-mail, palavras-passe nem tokens.

## Erros ao utilizador (cadastro)

- `auth/operation-not-allowed` → instruções para activar Email/Password na consola Firebase.
- `auth/network-request-failed` → rede.
- `failed-precondition` / `aborted` / `unavailable` / `resource-exhausted` → mensagem genérica de retry temporal.
