# DOC_StackTecnologica

## Runtime e framework

| Peça | Versão / origem |
|------|-----------------|
| Next.js | 16.2.0 ([package.json](../../package.json)) |
| React / React DOM | ^19 |
| TypeScript | 5.7.3 (strict) |

## UI e estilo

| Peça | Uso |
|------|-----|
| Tailwind CSS | 4.x via `@tailwindcss/postcss` ([postcss.config.mjs](../../postcss.config.mjs)) |
| shadcn/ui | style `new-york`, RSC ([components.json](../../components.json)) |
| Radix UI | Primitivos `@radix-ui/react-*` (accordion, dialog, dropdown, etc.) |
| lucide-react | Ícones |
| next-themes | Tema (forçado dark) |
| sonner | Toasts |

## Estado e formulários

| Peça | Uso |
|------|-----|
| zustand | `auth-store`, `territory-store`, `run-store` |
| react-hook-form + @hookform/resolvers | Formulários + Zod |
| zod | Validação de schemas |

## Dados e backend

| Peço | Uso |
|------|-----|
| firebase (JS SDK) | Auth, Firestore no cliente |
| firebase-admin | Apenas servidor: [`lib/firebase/admin-app.ts`](../../lib/firebase/admin-app.ts), [`app/api/territories/capture/route.ts`](../../app/api/territories/capture/route.ts) |
| server-only | Garante módulos só Node |

## Mapa e geo

| Peça | Uso |
|------|-----|
| leaflet + react-leaflet | Mapa e camadas |
| @turf/turf | Operações geométricas (interseções, áreas, etc.) |
| geojson | Tipos |

## Analytics

| Peça | Uso |
|------|-----|
| @vercel/analytics | [`app/layout.tsx`](../../app/layout.tsx), só `production` |

## Outras dependências notáveis

| Peça | Uso |
|------|-----|
| date-fns | Datas |
| recharts | Gráficos (se usados nas páginas) |
| embla-carousel-react | Carrosséis shadcn |

Ver inventário completo em [DOC_DependenciasNPM.md](../Dependencias/DOC_DependenciasNPM.md).
