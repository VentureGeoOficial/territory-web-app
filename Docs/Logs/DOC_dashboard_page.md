# DOC_dashboard_page

**Arquivos:** [`app/(authenticated)/dashboard/page.tsx`](../../app/(authenticated)/dashboard/page.tsx), [`lib/firebase/dashboard-runs.ts`](../../lib/firebase/dashboard-runs.ts)

## Logs estruturados (`lib/logging/logger.ts`)

| Evento | Nível | Scope | Objetivo |
|--------|-------|-------|----------|
| `page_view` | INFO | `DashboardPage` | Entrada na rota Dashboard (uid mascarado) |
| `subscribe_error` | ERROR | `dashboard-runs` | Falha ao subscrever coleção `runs` |

**Não registra:** `routeJson`, coordenadas GPS, tokens ou email completo.

## Contexto típico

- `uid`: utilizador autenticado (mascarado)
- `message`: mensagem de erro Firestore (sem dados sensíveis)
