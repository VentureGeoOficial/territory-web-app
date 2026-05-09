# DOC_useGlobalLeaderboard

**Ficheiro:** [`hooks/use-global-leaderboard.ts`](../../hooks/use-global-leaderboard.ts)

## Assinatura

`useGlobalLeaderboard(limit = 50)` → `RankingEntry[]`

## Comportamento

- `getLeaderboardRepository()` — se null, `entries` fica `[]`.
- Caso contrário `subscribeGlobalLeaderboard(setEntries, limit)`.

## Nota

A função auxiliar `buildFromStore` no ficheiro **não é usada** pelo hook exportado — código morto local (ver relatório dependências).
