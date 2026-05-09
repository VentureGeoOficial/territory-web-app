# DOC_TransactionsService

**Ficheiro:** [`lib/firebase/transactions.ts`](../../lib/firebase/transactions.ts)  
**Escopo:** `server-only` — usa Admin SDK.

## `executeCaptureTransaction(input)`

Transação atómica para **captura hostil** (corrida que sobrepõe territórios inimigos):

- Debita XP (`xpCost`), credita ganho (`xpGain`), valida saldo.
- Marca territórios sobrepostos como expirados / não capturáveis conforme lógica interna.
- Cria novo território em estado `protected`.
- Escreve corrida em `runs`.

## Erro tipado

`CaptureTransactionError` com `code`: `OVERLAP_MISMATCH` | `NOT_FOUND` | `PROTECTED` | `INVALID_OWNER` | `INSUFFICIENT_XP`.

## Chamador

- [`POST /api/territories/capture`](../../app/api/territories/capture/route.ts) após validação de corpo e impacto geométrico no route handler.
