# DOC_RunCompletionService

**Ficheiro:** [`lib/firebase/run-completion.ts`](../../lib/firebase/run-completion.ts)

## `submitCompletedRunViaApi(params)`

| Campo | Descrição |
|-------|-----------|
| `points`, `startedAt`, `endedAt`, … | Igual ao payload validado em [`POST /api/runs/complete`](../../app/api/runs/complete/route.ts) |
| `idToken` | Bearer para o servidor |

Chama `fetch('/api/runs/complete')` com `Authorization: Bearer`. Não escreve diretamente no Firestore.

## Consumidor principal

- [`components/map/map-controls.tsx`](../../components/map/map-controls.tsx) ao finalizar corrida GPS (sem overlap inimigo).
