# DOC_TelaCompeticao

**Rota:** `/competicao`  
**Ficheiro:** [`app/(authenticated)/competicao/page.tsx`](../../app/(authenticated)/competicao/page.tsx)

- `useGlobalLeaderboard(50)` + `subscribeAcceptedFriends` para tab amigos.
- Tabs: ranking global vs ranking filtrado a amigos (`friendsOnly` memo).
- `AuthenticatedShell` + `MobileBottomNav`.
