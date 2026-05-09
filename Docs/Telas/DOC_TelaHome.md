# DOC_TelaHome

**Rota:** `/`  
**Ficheiro:** [`app/page.tsx`](../../app/page.tsx)

## Comportamento real

Renderiza apenas `<MarketingLanding />` — **não** usa `HomePageClient` nem dashboard autenticado nesta entrada.

Implicação: utilizadores autenticados que abrem `/` veem a landing de marketing (não o dashboard), salvo redirecionamento externo noutro sítio.

## Tipo

`'use client'` (root da home é client porque `MarketingLanding` é client).

## Dependências

- [`components/home/marketing-landing.tsx`](../../components/home/marketing-landing.tsx)
