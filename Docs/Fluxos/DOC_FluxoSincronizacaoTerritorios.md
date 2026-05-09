# DOC_FluxoSincronizacaoTerritorios

1. Página mapa monta [`useFirestoreTerritorySync`](../../hooks/use-firestore-territory-sync.ts).
2. `getTerritoryRepository()` → `subscribeTerritories` → `onSnapshot` coleção `territories`.
3. Lista aplicada a `territory-store`; utilizadores derivados + merge com perfil existente.
4. [`useCurrentUserPublicProfile`](../../hooks/use-public-profile-sync.ts) atualiza stats a partir de `publicProfiles/{uid}`.
