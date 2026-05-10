# DOC_FirestoreIndexes

**Ficheiro:** [`firestore.indexes.json`](../../firestore.indexes.json)

## Índices compostos definidos

| Coleção | Campos | Uso típico |
|---------|--------|------------|
| `friendRequests` | `toUserId` ASC, `status` ASC | Queries de pedidos recebidos por estado |
| `friendRequests` | `fromUserId` ASC, `status` ASC | Pedidos enviados |
| `users` | `totalAreaM2` DESC | Ranking global ([`lib/firebase/ranking.ts`](../../lib/firebase/ranking.ts)) |
| `users` | `email` ASC | Lookup por email (amigos) |
| `users` | `username` ASC | Lookup Admin por slug quando `usernames/{slug}` em falta ([`/api/friends/lookup`](../../app/api/friends/lookup/route.ts)) |
| `territories` | `status` ASC, `createdAt` ASC | Listagens filtradas por estado/tempo |
| `territories` | `centerLat` ASC | Query por faixa de latitude do centro do território ([`subscribeTerritories`](../../lib/firebase/territories.ts) + viewport do mapa) |

**fieldOverrides:** vazio.

Deploy: `firebase deploy --only firestore:indexes` (Firebase CLI).
