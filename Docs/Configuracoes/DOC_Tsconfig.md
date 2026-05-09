# DOC_Tsconfig

**Ficheiro:** [`tsconfig.json`](../../tsconfig.json)

## Opções relevantes

| Opção | Valor | Impacto |
|-------|-------|---------|
| `strict` | `true` | Checagens estritas TS |
| `moduleResolution` | `bundler` | Resolução alinhada ao bundler Next |
| `jsx` | `react-jsx` | JSX moderno |
| `paths["@/*"]` | `["./*"]` | Imports `@/components/...` → raiz |

## Include / exclude

- Inclui `.next/types/**/*.ts` para tipos gerados pelo Next.
- Exclui apenas `node_modules`.

Note: com `next.config.mjs` ignorando erros de TS no build, `strict` ajuda no IDE mas não bloqueia deploy.
