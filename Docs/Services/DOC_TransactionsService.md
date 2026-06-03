# DOC_TransactionsService

**Ficheiro:** [`lib/firebase/transactions.ts`](../../lib/firebase/transactions.ts)  
**Escopo:** `server-only` — usa Admin SDK.

## `executeCaptureTransaction(input)`

Transação atómica para **captura hostil** (corrida que sobrepõe territórios inimigos):

- Debita XP (`xpCost`), credita ganho (`xpGain`), valida saldo.
- Marca territórios sobrepostos como expirados / reduz parcialmente conforme lógica interna.
- Cria novo território em estado `protected`.
- Escreve corrida em `runs` com `routeJson`.
- Regista eventos em `territories/{id}/events` (emoji opcional).
- **Notificações in-app:** movidas para `sendCaptureNotifications` pós-transação (não fazem parte desta transação).

## Logs

| Evento | Nível | Objetivo |
|--------|-------|----------|
| `capture_victim_partial_shrink` | INFO | Rastrear redução parcial de território vítima |
| `capture_victim_full_expire` | INFO | Rastrear expiração total de território vítima |
| `capture_difference_failed` | WARN | Geometria de diferença inválida sem interseção útil |

## Erro tipado

`CaptureTransactionError` com `code`: `OVERLAP_MISMATCH` | `NOT_FOUND` | `PROTECTED` | `INVALID_OWNER` | `INSUFFICIENT_XP`.

## Chamador

- [`POST /api/territories/capture`](../../app/api/territories/capture/route.ts) após validação de corpo e impacto geométrico no route handler.
