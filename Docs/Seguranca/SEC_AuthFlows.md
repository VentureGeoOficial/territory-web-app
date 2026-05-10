# SEC_AuthFlows

## A01:2021 Broken Access Control

| Achado | Severidade | Detalhe |
|--------|------------|---------|
| Rotas públicas acessíveis a todos | OK | Esperado |
| `(authenticated)` protegido por AuthGuard + Firebase session | OK | Dupla camada (UI + Auth state) |

**Risco:** AuthGuard só valida presença de `user` + `accessToken` na store — não verifica expiração em tempo real antes de cada navegação (Firebase SDK renova token em background). **MÉDIO** — utilizador com token revogado pode ter estado até refresh.

## A07:2021 Identification and Authentication Failures

- Firebase Auth gere passwords; reset por email.
- Google OAuth via popup — depende de domínios autorizados no Firebase Console.

Mitigação recomendada: Firebase App Check (não implementado no código analisado).

## APIs servidor (2026-05-09)

- `verifyIdToken(token, true)` nas rotas `/api/runs/complete`, `/api/territories/capture`, `/api/friends/lookup` — revogação ativa.
- Login por username usa [`POST /api/auth/resolve-identifier`](../../app/api/auth/resolve-identifier/route.ts) (Admin): resolve `usernames/{slug}` → `users/{uid}` → campo `email`; se `usernames` estiver em falta, fallback **`users` onde `username == slug`** (alinhado ao lookup de amigos). No cliente, [`lib/auth/auth-service.ts`](../../lib/auth/auth-service.ts) trata como **e-mail** qualquer identificador com **exatamente um `@`** e parte local não vazia (suporta domínios multi-segmento, ex.: `.com.br`), evitando regex restritiva que enviava esses valores ao resolver de username.
