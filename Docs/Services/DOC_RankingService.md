# DOC_RankingService

**Ficheiro:** [`lib/firebase/ranking.ts`](../../lib/firebase/ranking.ts)

## `subscribeGlobalLeaderboard(onUpdate, max = 50)`

- Coleção: **`publicProfiles`** (não `users`) — ordenação `totalAreaM2` desc, `limit(max)`.
- Mapeia cada doc para `RankingEntry`: `userId` = doc id, nome/cor/área/contagem dos campos do perfil público.

## Implicação

O ranking da UI depende de `publicProfiles` estar sincronizado com stats agregadas — as escritas em território/corrida atualizam `users` e `publicProfiles` nas transações relevantes.
