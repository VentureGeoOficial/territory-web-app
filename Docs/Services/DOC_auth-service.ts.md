# DOC_auth-service.ts

**Ficheiro:** [`lib/auth/auth-service.ts`](../../lib/auth/auth-service.ts)

## Logs

| Contexto | Nível | Dados registados |
|----------|-------|------------------|
| Falha genérica em `registerWithFirebase` | `console.error` | `timestamp ISO`, `[ERROR]`, funcionalidade, `source`, `code` Firebase/Firestore (quando existe) |
| Falha sem `code` no `catch` de registo | `console.error` | idem sem `code` |

**Segurança:** não registar e-mail, palavras-passe nem tokens.

## Erros ao utilizador (cadastro)

- `auth/operation-not-allowed` → instruções para activar Email/Password na consola Firebase.
- `auth/network-request-failed` → rede.
- `failed-precondition` / `aborted` / `unavailable` / `resource-exhausted` → mensagem genérica de retry temporal.
