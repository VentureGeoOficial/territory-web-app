# DOC_LogsIndex

## Documentação canónica Firebase

- [Docs/Firebase/observabilidade.md](../Firebase/observabilidade.md)

## Pontos de log no código Next

| Local | Nível | Conteúdo |
|-------|-------|----------|
| [`app/api/territories/capture/route.ts`](../../app/api/territories/capture/route.ts) | `warn` | Falha `verifyIdToken` — só `reason`, sem token |
| Mesmo ficheiro | `error` | Erros genéricos handler |
| [`hooks/use-firestore-territory-sync.ts`](../../hooks/use-firestore-territory-sync.ts) | `error` | Erros snapshot territórios |
| [`components/home/home-page-client.tsx`](../../components/home/home-page-client.tsx) | `log` | `[v0]` debug — deve ser removido em produção |
| [`app/error.tsx`](../../app/error.tsx) | `error` | Erro boundary |

**Não existe** logger estruturado centralizado; padrão atual = `console.*`.
