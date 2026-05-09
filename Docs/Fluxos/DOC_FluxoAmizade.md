# DOC_FluxoAmizade

1. [`/amigos`](../../app/(authenticated)/amigos/page.tsx): email → `lookupFriendUid` (`POST /api/friends/lookup` com Id Token).
2. `sendFriendRequest(fromUid, toUid)` cria doc `friendRequests` pending.
3. Destinatário aceita/recusa: `acceptFriendRequest` / `rejectFriendRequest`.
4. Remetente pode `cancelFriendRequest` → `cancelled`.
5. Listagens usam `subscribeFriendRequests` / `subscribeAcceptedFriends` com índices compostos.
