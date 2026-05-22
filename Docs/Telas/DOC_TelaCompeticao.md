# DOC_TelaCompeticao

**Rota:** `/competicao`  
**Ficheiro:** [`app/(authenticated)/competicao/page.tsx`](../../app/(authenticated)/competicao/page.tsx)

- `useGlobalLeaderboard(50)` + `useFriendIds()` para filtrar amigos.
- Métrica exibida: **XP total** (`formatXp` em [`lib/territory/geo.ts`](../../lib/territory/geo.ts)).
- Tabs: **Global** — top 50 por `xp` em `publicProfiles`; **Amigos** — subset reordenado por `xp`.
- Destaque do utilizador atual: fundo `primary/5`, badge «Você», valor XP em `text-primary`.
- `AuthenticatedShell` + `MobileBottomNav`.

**Fora de escopo desta tela:** área dominada continua no mapa, header, `/dashboard` e troféus.
