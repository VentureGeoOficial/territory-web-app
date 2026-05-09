# DOC_TerritoryRepository

**Ficheiro:** [`lib/data/territory-repository.ts`](../../lib/data/territory-repository.ts)

## Interfaces

- `TerritoryRepository` — `subscribeTerritories(onUpdate, onError?)`
- `LeaderboardRepository` — `subscribeGlobalLeaderboard(onUpdate, max?)`

## Fábricas

| Função | Comportamento atual |
|--------|---------------------|
| `getTerritoryRepository()` | Se `isFirebaseConfigured()` → objeto que delega para [`subscribeTerritories`](../../lib/firebase/territories.ts); senão **`null`** |
| `getLeaderboardRepository()` | Idem para [`subscribeGlobalLeaderboard`](../../lib/firebase/ranking.ts) |

**Nota:** Não há implementação mock alternativa neste ficheiro — retorno `null` obriga os hooks a tratarem ausência (ver hooks de sync / leaderboard).
