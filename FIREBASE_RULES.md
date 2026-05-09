# Firestore Rules — TerritoryRun (produção)

Ficheiro canónico: [`firestore.rules`](firestore.rules).

## Por coleção

### `users/{uid}`

| Operação | Quem | Validação |
|----------|------|-----------|
| read | Dono (`auth.uid == uid`) | — |
| create | Dono | Stats iniciais zero; chaves permitidas (cadastro completo ou perfil mínimo) |
| update | Dono | **Stats e email/username imutáveis** (anti-fraude no ranking) |
| delete | — | Negado |

### `publicProfiles/{uid}`

| Operação | Quem | Validação |
|----------|------|-----------|
| read | Público | — (ranking / social) |
| create | Dono | Stats zero |
| update | Dono | Apenas `displayName`, `username`, `updatedAt` (diff); stats imutáveis |
| delete | — | Negado |

Escrita de stats após corridas/capturas é feita pelo **Admin SDK** nas rotas API / Functions.

### `usersPrivate/{uid}`

| Operação | Quem |
|----------|------|
| read/write/update/delete | Dono |

### `usernames/{slug}`

| Operação | Quem | Validação |
|----------|------|-----------|
| read | Público | — |
| create | Autenticado | **Só** `uid` + `createdAt` (sem email — mitiga enumeração de PII) |
| update/delete | — | Negado |

### `territories/{id}`

| Operação | Quem |
|----------|------|
| read | Público (mapa global) |
| write | **Negado no cliente** — apenas Admin |

### `runs/{id}`

| Operação | Quem |
|----------|------|
| read | Dono da corrida |
| write | **Negado no cliente** — apenas Admin |

### `friendRequests/{id}`

| Operação | Quem | Validação |
|----------|------|-----------|
| read | Remetente ou destinatário | |
| create | Remetente | `status == pending`; campos fixos |
| update | Destinatário aceita/recusa; remetente cancela | Transições de estado controladas (anti auto-aceitação) |
| delete | — | Negado |

### Catch-all `/{document=**}`

Negado explicitamente.

## Testes

Suíte: `npm run test:rules` (requer `vitest` e `@firebase/rules-unit-testing` instalados). Ver [`__tests__/firestore-rules/firestore-rules.test.ts`](__tests__/firestore-rules/firestore-rules.test.ts).
