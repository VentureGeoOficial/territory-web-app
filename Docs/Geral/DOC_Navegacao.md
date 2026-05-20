# DOC_Navegacao

## Rotas públicas

`/`, `/login`, `/cadastro`, `/esqueci-senha`, `/termos`, `/privacidade`

## Rotas autenticadas (AuthGuard)

`/mapa`, `/competicao`, `/amigos`, `/trofeus`, `/conta`, `/conta/excluir`, `/seguranca`, `/ajuda`

## Navegação global autenticada

- **Desktop:** [`Header`](../../components/layout/header.tsx) — lista `navItems`.
- **Mobile:** [`MobileBottomNav`](../../components/layout/mobile-bottom-nav.tsx) — subset (sem ajuda).

## Redirecionamentos programáticos

- Login sucesso → `/mapa` ([`login-form`](../../components/auth/login-form.tsx)).
- Logout header → `/`.
- AuthGuard sem sessão → `/login`.
