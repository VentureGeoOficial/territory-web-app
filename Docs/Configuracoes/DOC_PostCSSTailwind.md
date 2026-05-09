# DOC_PostCSSTailwind

## PostCSS

**Ficheiro:** [`postcss.config.mjs`](../../postcss.config.mjs)

```js
plugins: {
  '@tailwindcss/postcss': {},
}
```

Tailwind CSS **v4** integrado via plugin PostCSS oficial.

## CSS global

**Ficheiro:** [`app/globals.css`](../../app/globals.css)

- `@import 'tailwindcss'`
- `@import 'tw-animate-css'`
- `@custom-variant dark (&:is(.dark *));`
- Variáveis CSS em `:root` e `.dark` para tema "Cyberpunk" (cores primary lime, navy, etc.)

## shadcn

**Ficheiro:** [`components.json`](../../components.json)

- CSS: `app/globals.css`
- Aliases: `@/components`, `@/lib/utils`, `@/components/ui`, `@/hooks`
