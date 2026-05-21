# DOC_Header

**Ficheiro:** [`components/layout/header.tsx`](../../components/layout/header.tsx)

- Mobile: `Sheet` com `mobileSheetNavItems` (mapa, competição, amigos, **loja**, conta, ajuda) + links de `profileMenuItems` (troféus).
- Dropdown utilizador: `profileMenuItems` (conta, troféus, ajuda) + `handleLogout` → `signOutRemote` + `logout()` + `router.replace('/')`.
- Config: [`lib/navigation/nav-config.ts`](../../lib/navigation/nav-config.ts).
- Dados: `useTerritoryStore`, `useAuthStore`; `formatArea`.
