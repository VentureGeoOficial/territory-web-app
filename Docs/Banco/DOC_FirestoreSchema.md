# DOC_FirestoreSchema

Fonte de verdade detalhada por campo: [`Docs/modelo-dados-firestore.md`](../modelo-dados-firestore.md). Este ficheiro resume coleções e responsabilidade.

## Coleções principais

| Coleção | Doc ID | Propósito |
|---------|--------|-----------|
| `users` | UID Auth | Perfil, stats agregadas (`totalAreaM2`, `territoriesCount`, `xp`), dados cadastro |
| `usernames` | slug único | Índice username → `uid` |
| `publicProfiles` | UID | Perfil público (leitura aberta nas rules) |
| `usersPrivate` | UID | Dados sensíveis do utilizador |
| `territories` | ID cliente | Polígono serializado, área, estado |
| `runs` | ID corrida | Corridas finalizadas (GPS + métricas) |
| `friendRequests` | ID auto | Pedidos de amizade |

## Serialização de território

Interface canónica no código: [`TerritoryFirestoreDoc`](../../lib/firebase/territory-doc.ts) — campo `polygonJson` como string JSON do `Feature<Polygon>`.

## Operações transacionais críticas

- Criação de território + atualização de stats do utilizador: [`lib/firebase/territories.ts`](../../lib/firebase/territories.ts) (`runTransaction`).
- Captura hostil / overlap: [`lib/firebase/transactions.ts`](../../lib/firebase/transactions.ts) (Admin SDK).
- Registo: [`lib/firebase/user-profile.ts`](../../lib/firebase/user-profile.ts) — transação `usernames` + `users`.
