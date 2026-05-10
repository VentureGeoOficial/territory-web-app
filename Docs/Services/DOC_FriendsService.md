# DOC_FriendsService

**Ficheiro:** [`lib/firebase/friends.ts`](../../lib/firebase/friends.ts)  
**Façada UI:** [`lib/services/friends-service.ts`](../../lib/services/friends-service.ts)

## Funções

| Função | Descrição |
|--------|-----------|
| `FRIEND_USERNAME_SLUG_PATTERN` | Regex `^[a-z0-9_]{3,20}$` — alinhada à API e ao campo na UI `/amigos`. |
| `validateNoExistingFriendship(...)` | Validação **no cliente** antes do lookup: `self`, `already_friend`, `pending_outgoing`, `pending_incoming`. |
| `lookupFriendUid({ email \| username, idToken })` | `POST /api/friends/lookup` — Admin: Firestore (`users.email` ou `usernames/{slug}`); e-mail com fallback Auth (`getUserByEmail`). Devolve `LookupFriendUidResult`. |
| `sendFriendRequest(from, to)` | Antes de `addDoc`, verifica duplicados (`pending`/`accepted`) entre o par via queries indexadas; lança `DUPLICATE_REQUEST` se existir. Depois `addDoc` em `friendRequests` `pending`. |
| `subscribeFriendRequests(userId, onUpdate)` | Duas queries snapshot: incoming/outgoing `pending`; merge |
| `acceptFriendRequest` / `rejectFriendRequest` | `updateDoc` status |
| `cancelFriendRequest` | Remetente define `cancelled` |
| `subscribeAcceptedFriends(userId, onUpdate)` | Duas queries `accepted`; deriva lista de IDs amigos |

Requer índices compostos — ver [DOC_FirestoreIndexes.md](../Banco/DOC_FirestoreIndexes.md).

## Observabilidade (cliente, consola)

Sem PII: apenas prefixos de 8 caracteres de UIDs e `requestId`.

| Nível | Momento | Mensagem |
|-------|---------|----------|
| INFO | Após `addDoc` pedido | `[friends]` JSON `event: request_sent`, `fromPrefix`, `toPrefix` |
| INFO | Aceitar pedido | `[friends]` JSON `event: request_accepted`, `requestIdPrefix` |
| INFO | Recusar pedido | `[friends]` JSON `event: request_rejected`, `requestIdPrefix` |
| INFO | Cancelar pedido | `[friends]` JSON `event: request_cancelled`, `requestIdPrefix` |
| WARN | Erro HTTP lookup | `[lookupFriendUid] API error` — ver [DOC_route_friends_lookup.md](../Firebase/DOC_route_friends_lookup.md) |

## Hooks relacionados

- [`DOC_useFriendIds.md`](../Hooks/DOC_useFriendIds.md), [`DOC_useFriendProfiles.md`](../Hooks/DOC_useFriendProfiles.md), [`DOC_useFriendsCount.md`](../Hooks/DOC_useFriendsCount.md).
