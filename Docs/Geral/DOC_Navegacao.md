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

## Alinhamento visual (Header + bottom nav)

- **Header mobile:** logo centralizada com posicionamento absoluto (`pointer-events-none`); menu e ações em slots simétricos `min-w-[4.5rem]`; ícones `h-10 w-10`.
- **Header desktop (`lg+`):** layout flex — logo + título, estatísticas (`md+`), dashboard e menu do utilizador.
- **Bottom nav:** `grid grid-cols-5`, `px-4`, `max-w-2xl`, labels truncadas, `min-h-[48px]` por item, `pb-[env(safe-area-inset-bottom)]` no iOS.
- **CTA corrida no mapa:** offset `3.5rem` + safe-area (ver [`lib/layout/z-index.ts`](../../lib/layout/z-index.ts) — `NAV_BAR_HEIGHT_REM`).
