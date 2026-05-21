# DOC_TelaLoja

**Rota:** `/loja`  
**Ficheiros:** [`app/(authenticated)/loja/page.tsx`](../../app/(authenticated)/loja/page.tsx), [`app/(authenticated)/loja/layout.tsx`](../../app/(authenticated)/loja/layout.tsx)

## Objetivo

Área comercial/esportiva para patrocinadores, parceiros, lojas e campanhas. Fase inicial com mocks `coming_soon` e CTA de patrocínio.

## Layout

- `AuthenticatedShell` + `MobileBottomNav`
- `main` com `max-w-4xl`, seções: hero, patrocinadores (tabs), banners, CTA patrocinador

## Componentes

| Componente | Ficheiro |
|------------|----------|
| `StoreHeroSection` | [`components/loja/store-hero-section.tsx`](../../components/loja/store-hero-section.tsx) |
| `ComingSoonSponsorsSection` | [`components/loja/coming-soon-sponsors-section.tsx`](../../components/loja/coming-soon-sponsors-section.tsx) |
| `FuturePartnersSection` | [`components/loja/future-partners-section.tsx`](../../components/loja/future-partners-section.tsx) |
| `PartnerHighlight` | [`components/loja/partner-highlight.tsx`](../../components/loja/partner-highlight.tsx) |

## Dados

- Hook [`hooks/use-sponsors.ts`](../../hooks/use-sponsors.ts) — mocks em [`lib/loja/mock-sponsors.ts`](../../lib/loja/mock-sponsors.ts)
- Futuro: coleção Firestore `sponsors`

## Navegação

- Barra inferior e sheet mobile (Header): item **Loja** (`Store` icon) — ver [`lib/navigation/nav-config.ts`](../../lib/navigation/nav-config.ts)
- **Troféus** no menu do perfil (dropdown + seção secundária do sheet)

## Observabilidade

Ver [DOC_loja_page.md](../Logs/DOC_loja_page.md).

## Segurança

Ver [SEC_loja_page.md](../Seguranca/loja/SEC_loja_page.md).
