# SEC — Autenticação (signup / login / sessão)

**Data:** 2026-05-20  
**Severidade geral corrigida:** ALTA (login impossível após cadastro)

---

## Vulnerabilidade 1 — Trim assimétrico de senha

| Campo | Valor |
|-------|-------|
| **Severidade** | ALTA |
| **Ficheiro** | `lib/auth/auth-service.ts` (versão anterior) |
| **Risco** | Cadastro gravava senha diferente da digitada; login subsequente falhava com "E-mail ou senha incorretos" |
| **Correcção** | Senha literal em signup e login; Zod `.refine(v => v === v.trim())` em ambos os schemas |

---

## Vulnerabilidade 2 — Enumeração username → email

| Campo | Valor |
|-------|-------|
| **Severidade** | MÉDIA |
| **Ficheiro** | `app/api/auth/resolve-identifier/route.ts` |
| **Risco** | Endpoint público permitia descobrir email associado a username |
| **Correcção** | Rate-limit 10 req/min/IP via `lib/api/auth-rate-limit.ts`; logs sem email |

---

## Vulnerabilidade 3 — Utilizador fantasma (Auth sem Firestore)

| Campo | Valor |
|-------|-------|
| **Severidade** | MÉDIA |
| **Risco** | Conta Auth existente sem `users/{uid}` após falha parcial de cadastro |
| **Correcção** | `AuthProvider` detecta (`auth_phantom_user_detected`) e chama `ensureUserProfile` |

---

## Vulnerabilidade 4 — Token revogado ainda aceite

| Campo | Valor |
|-------|-------|
| **Severidade** | BAIXA |
| **Ficheiro** | `lib/firebase/admin-auth.ts` |
| **Correcção** | `verifyAuthOrFail` default `checkRevoked: true` |

---

## Runbook de deploy

1. Deploy cliente + API (auth-service, schemas, rate-limit, remove create-profile).
2. Smoke: cadastro → logout → login com mesma senha.
3. Smoke: cadastro com espaços nas pontas → formulário deve **rejeitar** antes do Firebase.
4. Utilizadores bloqueados: orientar para `/esqueci-senha`.

## Rollback

- Reverter commit de `auth-service.ts` e `schemas.ts` restaura trim antigo (não recomendado).
- Se `checkRevoked: true` causar 401s: passar `checkRevoked: false` em rotas específicas.

## Checklist E2E

- [ ] Cadastro A → mapa → logout → login A OK
- [ ] Senha `" abc123"` (espaço inicial) rejeitada no formulário
- [ ] Banner de verificação de e-mail visível até confirmar
- [ ] `resolve-identifier` retorna 429 após 10 pedidos/min do mesmo IP
