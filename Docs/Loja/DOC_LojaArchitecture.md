# Arquitectura — Loja / Patrocinadores

## Rotas

| Rota | Ficheiro | Nav |
|------|----------|-----|
| `/loja` | `app/(authenticated)/loja/page.tsx` | Bottom nav + Sheet (substitui Troféus) |
| `/trofeus` | `app/(authenticated)/trofeus/page.tsx` | Acesso via `/conta` |

## Componentes

```
components/loja/
  store-hero-section.tsx   — destaque (featured ou placeholder)
  sponsor-grid.tsx         — grid + loading + empty
  sponsor-card.tsx         — card de parceiro
  sponsor-banner.tsx       — banner 3:1
  empty-sponsor-state.tsx  — sem patrocinadores
  partner-highlight.tsx    — CTA comercial
  sponsor-card-skeleton.tsx
```

## Dados

- Coleção Firestore: `sponsors`
- Leitura: `lib/firebase/sponsors.ts` → `subscribeSponsors`
- Hook: `hooks/use-sponsors.ts`

## Adicionar patrocinador real

1. Firestore Console → `sponsors` → novo documento
2. Campos obrigatórios: `name`, `category`, `description`, `status`, `order`, `createdAt`, `updatedAt`
3. Para hero: `featured: true`, `bannerUrl` opcional
4. CTA: `ctaUrl` deve ser `https://...`

Ou executar seed de demo: `pnpm seed:sponsors`

## UX

- Tema dark + lime (`primary`) + electric (`accent`)
- Grid responsivo 1 / 2 / 3 colunas
- Bottom nav com 5 itens (Loja no lugar de Troféus)
