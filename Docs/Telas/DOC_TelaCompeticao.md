# DOC_TelaCompeticao

**Rota:** `/competicao`  
**Ficheiro:** [`app/(authenticated)/competicao/page.tsx`](../../app/(authenticated)/competicao/page.tsx)

- `useGlobalLeaderboard(50)` + `useFriendIds()` para filtrar amigos.
- Tabs: **Global** lista o top 50 de `publicProfiles`; **Amigos** ranking filtrado a `{ eu } ∪ amigos` (`friendsOnly` memo).
- `AuthenticatedShell` + `MobileBottomNav`.
