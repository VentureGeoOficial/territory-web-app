# DOC_usePublicProfileSync

**Ficheiro:** [`hooks/use-public-profile-sync.ts`](../../hooks/use-public-profile-sync.ts)

## Export real

`useCurrentUserPublicProfile(userId: string | undefined)` — o nome do ficheiro não coincide com o export.

## Comportamento

- Se sem `userId` ou Firebase off → não subscreve.
- `onSnapshot` em `publicProfiles/{userId}` → `upsertUser` na territory-store com stats agregadas (`totalAreaM2`, `territoriesCount`, distância, duração).

## Consumidores

- Tipicamente shell/dashboard onde o utilizador autenticado precisa de stats atualizados sem derivar só de polígonos.
