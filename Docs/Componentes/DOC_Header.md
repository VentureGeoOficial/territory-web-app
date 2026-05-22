# DOC_Header

**Ficheiro:** [`components/layout/header.tsx`](../../components/layout/header.tsx)

- Mobile: `Sheet` com `mobileSheetNavItems` (**dashboard**, mapa, competição, amigos, loja, conta, ajuda) + links de `profileMenuItems` (troféus).
- Acesso rápido: botão `LayoutDashboard` → `/dashboard` à esquerda do menu do utilizador (cluster direito do header).
- Dropdown utilizador: `profileMenuItems` (conta, troféus, ajuda) + `handleLogout` → `signOutRemote` + `logout()` + `router.replace('/')`.
- Config: [`lib/navigation/nav-config.ts`](../../lib/navigation/nav-config.ts).
- Dados: `useTerritoryStore`, `useAuthStore`; `formatArea`.
