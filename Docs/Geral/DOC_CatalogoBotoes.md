# DOC_CatalogoBotoes

Catálogo dos principais botões **`<Button>` / links com role de ação** (não lista cada ícone shadcn isolado).

## Auth

| Texto / papel | Local | Ação |
|---------------|-------|------|
| Entrar | [`login-form`](../../components/auth/login-form.tsx) | `form.handleSubmit` → `login` |
| Entrar com Google | login-form | `loginWithGoogle` |
| Mostrar/ocultar senha | login-form | toggle estado |
| Criar conta | signup-form | `registerWithFirebase` |

## Layout

| Texto | Local | Ação |
|-------|-------|------|
| Abrir menu | Header mobile | abre `Sheet` |
| Links nav | Header | `Link` para rotas |
| Sair | Header dropdown | `signOutRemote` + `logout` |

## Home autenticada

| Texto | Local | Ação |
|-------|-------|------|
| Mapa, Competição, Amigos, Troféus, Conta, Ajuda | [`authenticated-dashboard`](../../components/home/authenticated-dashboard.tsx) | `Link` |

## Mapa

| Texto / papel | Local | Ação |
|---------------|-------|------|
| Iniciar / cancelar / finalizar corrida | [`map-controls`](../../components/map/map-controls.tsx) | run session + persistência / API capture |
| Confirmar captura | [`capture-xp-dialog`](../../components/map/capture-xp-dialog.tsx) | `onConfirm` → fetch API |

## Marketing landing

| Texto | Local | Ação |
|-------|-------|------|
| CTAs primários/secundários | [`marketing-landing`](../../components/home/marketing-landing.tsx) | `Link` login/cadastro, instalar PWA |

## Mapa Leaflet interno

Botões dentro de [`territory-map.tsx`](../../components/map/territory-map.tsx) (Crosshair, modos) — ver ficheiro para lista exata de handlers.

## Error boundary

| Texto | Local | Ação |
|-------|-------|------|
| Tentar novamente | [`app/error.tsx`](../../app/error.tsx) | `reset()` |
