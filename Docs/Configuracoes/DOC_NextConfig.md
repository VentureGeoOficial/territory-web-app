# DOC_NextConfig

**Ficheiro:** [`next.config.mjs`](../../next.config.mjs)

## Conteúdo real

```js
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}
```

## Efeitos

| Opção | Comportamento |
|-------|----------------|
| `typescript.ignoreBuildErrors: true` | **Build não falha** por erros TypeScript. Risco: erros podem chegar a produção sem CI bloquear. |
| `images.unoptimized: true` | `next/image` não otimiza/remete por servidor de imagens — adequado a hosting estático ou quando não se usa o pipeline de otimização da Vercel para imagens. |

## O que não está configurado

- `experimental`, `headers`, `rewrites`, `redirects`, `env` — ausentes.
