# DOC_Header

**Ficheiro:** [`components/layout/header.tsx`](../../components/layout/header.tsx)

- Navegação desktop: links `navItems` (mapa, competição, amigos, troféus, conta, ajuda).
- Mobile: `Sheet` com menu hamburger; estatísticas utilizador (troféus territoriais, área).
- Dropdown utilizador: links perfil + `handleLogout` → `signOutRemote` + `logout()` + `router.replace('/')`.
- Dados: `useTerritoryStore`, `useAuthStore`; `formatArea`.
