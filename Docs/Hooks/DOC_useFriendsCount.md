# DOC_useFriendsCount

**Ficheiro:** [`hooks/use-friends-count.ts`](../../hooks/use-friends-count.ts)

## Assinatura

`useFriendsCount()` → `number`

## Comportamento

- `uid` de `useAuthStore`.
- Se sem uid ou Firebase off → `0`.
- Caso contrário `subscribeAcceptedFriends(uid, (ids) => setCount(ids.length))`.
