# DOC_useFirestoreTerritorySync

**Ficheiro:** [`hooks/use-firestore-territory-sync.ts`](../../hooks/use-firestore-territory-sync.ts)

## Função exportada

`useFirestoreTerritorySync()` — sem parâmetros.

## Lógica

1. `getTerritoryRepository()` — se **`null`** (Firebase não configurado), limpa `territories` e `users` na store e sai.
2. Caso contrário, subscreve `subscribeTerritories`; em cada update:
   - `setTerritories(list)`
   - Deriva `User[]` agregando por `userId` via `deriveUsersFromTerritories`
   - `mergeDerivedWithExisting` preserva stats do utilizador já na store (perfil público)
   - `setUsers(merged)`

## Erros

- Callback `onError` do snapshot → `console.error('[Firestore territories]', err)`.
