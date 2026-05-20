# DOC_Navegacao

## Rotas públicas

`/`, `/login`, `/cadastro`, `/esqueci-senha`, `/termos`, `/privacidade`

## Rotas autenticadas (AuthGuard)

`/mapa`, `/competicao`, `/amigos`, `/loja`, `/trofeus`, `/conta`, `/conta/excluir`, `/seguranca`, `/ajuda`

## Navegação global autenticada

- **Desktop:** [`Header`](../../components/layout/header.tsx) — lista `navItems`.
- **Mobile:** [`MobileBottomNav`](../../components/layout/mobile-bottom-nav.tsx) — Mapa, Competição, Amigos, **Loja**, Conta (Troféus via `/conta`).
- **Sheet:** inclui também Ajuda (`/ajuda`).

## Redirecionamentos programáticos

- Login sucesso → `/mapa` ([`login-form`](../../components/auth/login-form.tsx)).
- Logout header → `/`.
- AuthGuard sem sessão → `/login`.
