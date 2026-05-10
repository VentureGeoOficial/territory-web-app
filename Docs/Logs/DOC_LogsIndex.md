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
| [`lib/auth/auth-service.ts`](../../lib/auth/auth-service.ts) | `error` | `registerWithFirebase`: falha cadastro (`code` Firebase/Firestore, sem email) — ver [DOC_auth-service.ts.md](../Services/DOC_auth-service.ts.md) |
| [`lib/services/location-service.ts`](../../lib/services/location-service.ts) | `info` | Transições [`SpeedGate`](../Services/DOC_speed-gate.ts.md) em corrida (`enter`\|`exit`), sem coordenadas |
| [`hooks/use-public-profile-sync.ts`](../../hooks/use-public-profile-sync.ts) | `error` | Snapshot `publicProfiles` falhou (`message`, `userId`; sem segredos) |
| [`lib/firebase/client.ts`](../../lib/firebase/client.ts) | `error` / `warn` | Init app / fallback Firestore — ver [DOC_firebase-client.md](../Services/DOC_firebase-client.md) |

**Não existe** logger estruturado centralizado; padrão atual = `console.*`.
