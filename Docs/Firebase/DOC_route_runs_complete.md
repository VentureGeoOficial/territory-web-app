# Observabilidade — `app/api/runs/complete/route.ts`

## Logs

| Nível | Momento | Mensagem / contexto |
|-------|---------|---------------------|
| WARN | — | *(via `verifyAuthOrFail`)* token inválido — sem token JWT no log |
| ERROR | Handler catch | `[api/runs/complete]` + erro genérico (sem PII) |
| WARN | — | Falhas Zod já devolvem 400 sem log obrigatório |

## Objetivo

Rastrear falhas de persistência server-side e erros inesperados após endurecimento das Firestore Rules.

## Destino

Stdout (Vercel Logs / runtime Node).
