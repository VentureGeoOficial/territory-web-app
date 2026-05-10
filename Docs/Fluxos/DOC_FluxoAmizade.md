# DOC_FluxoAmizade

0. Validação local: `validateNoExistingFriendship` + formato `@username`; `sendFriendRequest` revalida duplicados (`pending`/`accepted`) antes de gravar.
1. [`/amigos`](../../app/(authenticated)/amigos/page.tsx): **username** (slug) → `lookupFriendUid` (`POST /api/friends/lookup` com Id Token). API pode usar Firestore `usernames/{slug}` ou, se integração interna enviar e-mail, `users.email` + fallback Auth.
2. `sendFriendRequest(fromUid, toUid)` cria doc `friendRequests` pending (ou erro `DUPLICATE_REQUEST`).
3. Destinatário aceita/recusa: `acceptFriendRequest` / `rejectFriendRequest`.
4. Remetente pode `cancelFriendRequest` → `cancelled`.
5. Listagens usam `subscribeFriendRequests` / `subscribeAcceptedFriends` com índices compostos.
