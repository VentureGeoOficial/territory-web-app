# DOC_FriendsService

**Ficheiro:** [`lib/firebase/friends.ts`](../../lib/firebase/friends.ts)

## Funções

| Função | Descrição |
|--------|-----------|
| `lookupFriendUid({ email \| username, idToken })` | `POST /api/friends/lookup` — Admin resolve uid |
| `sendFriendRequest(from, to)` | `addDoc` em `friendRequests` status `pending` |
| `subscribeFriendRequests(userId, onUpdate)` | Duas queries snapshot: incoming/outgoing pending; merge |
| `acceptFriendRequest` / `rejectFriendRequest` | `updateDoc` status |
| `cancelFriendRequest` | Remetente define `cancelled` |
| `subscribeAcceptedFriends(userId, onUpdate)` | Duas queries `accepted`; deriva lista de IDs amigos |

Requer índices compostos — ver [DOC_FirestoreIndexes.md](../Banco/DOC_FirestoreIndexes.md).
