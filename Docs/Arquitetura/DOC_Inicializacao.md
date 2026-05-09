# DOC_Inicializacao

## Ciclo de arranque do browser

1. **HTML** servido pelo Next para a rota pedida.
2. **Root layout** [`app/layout.tsx`](../../app/layout.tsx):
   - Carrega fontes Google (`Montserrat`, `Geist_Mono`) via `next/font`.
   - Importa [`app/globals.css`](../../app/globals.css) (Tailwind 4 + tokens de tema).
   - Envolve `children` em [`Providers`](../../components/providers.tsx) (client component).
   - Em produção: monta [`@vercel/analytics`](../../package.json) (`Analytics`).
3. **`Providers`** ([`components/providers.tsx`](../../components/providers.tsx)):
   - `useEffect` → [`registerServiceWorker`](../../lib/pwa/register-sw.ts) (PWA).
   - `ThemeProvider` ([`components/theme-provider.tsx`](../../components/theme-provider.tsx)) — `next-themes`, tema escuro forçado.
   - `AuthProvider` — subscrição Firebase Auth quando configurado.
   - `Toaster` (Sonner) para notificações toast.

## Arranque das rotas autenticadas

- Layout [`app/(authenticated)/layout.tsx`](../../app/(authenticated)/layout.tsx) envolve filhos em [`AuthGuard`](../../components/auth/auth-guard.tsx).
- `AuthGuard` espera hidratação do Zustand persistido + `firebaseAuthReady` do contexto + `isAuthenticated`; caso contrário redireciona para `/login`.

## Arranque no servidor (SSR/RSC)

- Páginas e layouts **sem** `'use client'` são Server Components por defeito.
- Componentes `'use client'` hidratam no cliente e podem importar Firebase SDK cliente apenas no bundle cliente.

## Variáveis de ambiente

- Incorporação em build: `NEXT_PUBLIC_*` ([`lib/config/firebase-env.ts`](../../lib/config/firebase-env.ts)).
- Segredo servidor: `FIREBASE_SERVICE_ACCOUNT_JSON` ([`lib/config/firebase-admin-env.ts`](../../lib/config/firebase-admin-env.ts)).

Ver também [DOC_VercelDeploy.md](../Configuracoes/DOC_VercelDeploy.md).
