# DOC_useFriendsCount

**Ficheiro:** [`hooks/use-friends-count.ts`](../../hooks/use-friends-count.ts)

## Assinatura

`useFriendsCount()` → `number`

## Comportamento

- Delega em [`useFriendIds`](DOC_useFriendIds.md): devolve `useFriendIds().length`.
- Uma única subscrição a amigos aceites por instância do hook `useFriendIds` montada na árvore.
