# Logs — Autenticação (signup, login, sessão)

## Objetivo

Rastrear fluxos de cadastro, login, verificação de e-mail, reset de senha e utilizadores fantasma (Auth sem Firestore).

## Eventos (cliente — `lib/auth/auth-service.ts`)

| Evento | Nível | Descrição |
|--------|-------|-----------|
| `auth_signup_started` | INFO | Início do cadastro (`emailDomain` mascarado) |
| `auth_signup_succeeded` | INFO | Cadastro concluído (`uid` mascarado) |
| `auth_signup_failed` | ERROR | Falha (`code` Firebase ou Firestore) |
| `auth_login_started` | INFO | Tentativa de login |
| `auth_login_succeeded` | INFO | Login OK |
| `auth_login_failed` | ERROR | Login falhou (`code`) |
| `auth_password_reset_requested` | INFO | Pedido de reset |
| `auth_password_reset_failed` | ERROR | Falha no envio |
| `auth_email_verification_sent` | INFO | E-mail de verificação enviado |
| `auth_email_verification_failed` | WARN | Falha ao enviar (signup não aborta) |
| `auth_logout` | INFO | Logout remoto |

## Eventos (`AuthProvider`)

| Evento | Nível | Descrição |
|--------|-------|-----------|
| `auth_phantom_user_detected` | CRITICAL | Firebase Auth activo mas `users/{uid}` ausente |
| `auth_ensure_profile_failed` | WARN | `ensureUserProfile` falhou — sessão mantida |

## Eventos (Firebase client)

| Evento | Nível | Descrição |
|--------|-------|-----------|
| `auth_persistence_local_failed` | WARN | Fallback para `inMemoryPersistence` |

## Eventos (API — `resolve-identifier`)

| Evento | Nível | Descrição |
|--------|-------|-----------|
| `auth_resolve_identifier_ok` | INFO | Lookup bem-sucedido (sem email no log) |
| `auth_resolve_identifier_not_found` | INFO | Username não encontrado |
| `auth_resolve_identifier_rate_limited` | WARN | IP excedeu 10 req/min |
| `auth_resolve_identifier_error` | ERROR | Erro interno |

## Segurança dos logs

- Nunca registar senhas, tokens JWT completos ou e-mails completos.
- `uid` mascarado via `lib/logging/logger.ts`.
- `emailDomain` apenas o domínio (ex.: `gmail.com`).

## Local de gravação

- Cliente: stdout / browser console (JSON).
- API Next.js: stdout Vercel → Cloud Logging.
- Cloud Functions: Google Cloud Logging.
