# DOC_StoresZustand

## auth-store

**Ficheiro:** [`lib/store/auth-store.ts`](../../lib/store/auth-store.ts)

| Aspeto | Detalhe |
|--------|---------|
| Persistência | `localStorage`, chave `territoryrun-auth` |
| Estado | `user`, `accessToken`, `refreshToken`, `expiresAt` |
| Ações | `setSession`, `logout` |
| Selector | `selectIsAuthenticated` — true se `user` e `accessToken` |

**Dado sensível:** `accessToken` (Firebase Id Token) persistido no browser — ver [SEC_TokensClienteSide.md](../Seguranca/SEC_TokensClienteSide.md).

## territory-store

**Ficheiro:** [`lib/store/territory-store.ts`](../../lib/store/territory-store.ts)

| Estado | Territórios, utilizadores derivados, `currentUserId`, mapa (centro, zoom, modo, seleção), filtros |
|--------|-----------------------------------------------------------------------------------------------------|
| Persistência | **Não** — só memória |
| Funções utilitárias | `getFilteredTerritories`, `getUserTerritories`, `getDisputedTerritories`, `getTotalAreaForUser`, etc. |

Centro inicial do mapa: `SUZANO_MAP_CENTER` ([`lib/territory/regions.ts`](../../lib/territory/regions.ts)).

## run-store

**Ficheiro:** [`lib/store/run-store.ts`](../../lib/store/run-store.ts)

| Estado | Permissão geo, `isRunning`, pontos GPS, distância acumulada, posição ao vivo, tracking |
|--------|-----------------------------------------------------------------------------------------|
| Persistência | **Não** |
| Uso | Corrida em tempo real no mapa; `appendTrackPoint` acumula distância Haversine |

## Integração com Firebase

- `AuthProvider` atualiza `auth-store` e `currentUserId` na territory-store.
- Hooks de sync (ex.: `useFirestoreTerritorySync`) enchem `territories` / `users` na territory-store.
