# DOC_useMobile

**Ficheiro:** [`hooks/use-mobile.ts`](../../hooks/use-mobile.ts)

## Export

`useIsMobile()` → `boolean`

## Implementação

- Breakpoint **768px** (`MOBILE_BREAKPOINT`).
- `matchMedia('(max-width: 767px)')` + listener `change`.
- Estado inicial `undefined` → retorno `!!isMobile` força boolean após primeiro paint.

## Consumidor conhecido

- [`components/ui/sidebar.tsx`](../../components/ui/sidebar.tsx)

## Duplicata

[`components/ui/use-mobile.tsx`](../../components/ui/use-mobile.tsx) — mesma lógica; possível código duplicado não referenciado.
