# DOC_Navegacao

## Rotas públicas

`/`, `/login`, `/cadastro`, `/esqueci-senha`, `/termos`, `/privacidade`

## Rotas autenticadas (AuthGuard)

`/dashboard`, `/mapa`, `/competicao`, `/amigos`, `/loja`, `/trofeus`, `/conta`, `/conta/excluir`, `/seguranca`, `/ajuda`

## Navegação global autenticada

Configuração central: [`lib/navigation/nav-config.ts`](../../lib/navigation/nav-config.ts).

- **Barra inferior:** [`MobileBottomNav`](../../components/layout/mobile-bottom-nav.tsx) — Mapa, Competição, Amigos, **Loja**, Conta.
- **Sheet mobile (Header):** **Dashboard** (topo), Mapa, Competição, Amigos, Loja, Conta, Ajuda — Troféus no menu do perfil.
- **Barra inferior:** inalterada (sem Dashboard).
- **Menu do perfil (Header dropdown + links secundários no sheet):** Minha conta, **Troféus**, Ajuda, Sair.

## Redirecionamentos programáticos

- Login sucesso → `/mapa` ([`login-form`](../../components/auth/login-form.tsx)).
- Logout header → `/`.
- AuthGuard sem sessão → `/login`.
