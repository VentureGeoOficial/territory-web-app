# DOC_Header

**Ficheiro:** [`components/layout/header.tsx`](../../components/layout/header.tsx)

- Mobile: `Sheet` com `mobileSheetNavItems` (mapa, competição, amigos, conta, ajuda) + links de `profileMenuItems` (troféus).
- Dropdown utilizador: `profileMenuItems` (conta, troféus, ajuda) + `handleLogout` → `signOutRemote` + `logout()` + `router.replace('/')`.
- Config: [`lib/navigation/nav-config.ts`](../../lib/navigation/nav-config.ts). Loja **não** aparece no sheet — só na barra inferior.
- Dados: `useTerritoryStore`, `useAuthStore`; `formatArea`.
