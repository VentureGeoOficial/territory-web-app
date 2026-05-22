# DOC_RankingService

**Ficheiro:** [`lib/firebase/ranking.ts`](../../lib/firebase/ranking.ts)

## `subscribeGlobalLeaderboard(onUpdate, max = 50)`

- Coleção: **`publicProfiles`** (não `users`) — ordenação **`xp` desc**, `limit(max)`.
- Mapeia cada doc para `RankingEntry`: `userId` = doc id, nome/cor/**xp**/contagem de territórios.
- Fallback: `xp` ausente ou inválido → `0` (com log WARNING `leaderboard_invalid_xp`).
- Erro na subscrição: log ERROR `leaderboard_subscribe_failed`, callback com lista vazia.
- Primeiro snapshot com sucesso: log INFO `leaderboard_updated` (uma vez por subscrição).

## Implicação

O ranking da UI depende de `publicProfiles.xp` estar sincronizado com `users.xp` nas transações de captura/corrida. `totalAreaM2` continua no perfil público para mapa, header e dashboard — não é usado nesta query.

## Índice Firestore

`firestore.indexes.json`: `publicProfiles` + `xp` DESC (deploy com `firebase deploy --only firestore:indexes`).
