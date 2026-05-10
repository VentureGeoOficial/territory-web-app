# DOC_useFriendIds

**Ficheiro:** [`hooks/use-friend-ids.ts`](../../hooks/use-friend-ids.ts)

## Assinatura

`useFriendIds()` → `string[]`

## Comportamento

- Obtém `uid` de `useAuthStore`.
- Se Firebase não configurado ou sem `uid` → `[]`.
- Caso contrário subscreve `subscribeAcceptedFriends` (via [`friends-service`](../../lib/services/friends-service.ts)) e devolve o array de IDs de amigos aceites em tempo real.

## Utilização

Mapa (`/mapa`), competição (`/competicao`), contagem no dashboard (`useFriendsCount`).
