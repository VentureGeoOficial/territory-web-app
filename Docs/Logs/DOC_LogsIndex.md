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
| [`components/home/marketing-landing.tsx`](../../components/home/marketing-landing.tsx) | `info` | Eventos `landing_cta_click` via Vercel Analytics — ver [DOC_marketing-landing.tsx.md](DOC_marketing-landing.tsx.md) |
| [`app/(authenticated)/loja/page.tsx`](../../app/(authenticated)/loja/page.tsx) | `info` | `page_view` via `lib/logging/logger` — ver [DOC_loja_page.md](DOC_loja_page.md) |
| [`components/loja/track-loja-cta.ts`](../../components/loja/track-loja-cta.ts) | `info` | `loja_cta_click` via Vercel Analytics — ver [DOC_loja_page.md](DOC_loja_page.md) |

**Logger centralizado:** [`lib/logging/logger.ts`](../../lib/logging/logger.ts) — JSON estruturado.

| DOC | Módulo |
|-----|--------|
| [DOC_run-territory.md](DOC_run-territory.md) | Polígono / buffer |
| [DOC_run-complete-api.md](DOC_run-complete-api.md) | API corrida |
| [DOC_capture-api.md](DOC_capture-api.md) | API conquista |
| [DOC_use-firestore-territory-sync.md](DOC_use-firestore-territory-sync.md) | Sync Firestore |
| [DOC_territory_visibility.md](DOC_territory_visibility.md) | Mapa só amigos (queries + CF) |
| [DOC_auth.md](DOC_auth.md) | Signup, login, sessão, phantom user |
| [DOC_speed-gate.md](DOC_speed-gate.md) | Anti-cheat velocidade |
