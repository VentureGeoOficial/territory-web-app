# DOC_export-report

**Arquivos:** [`lib/dashboard/export-report.ts`](../../lib/dashboard/export-report.ts), [`components/dashboard/dashboard-export-button.tsx`](../../components/dashboard/dashboard-export-button.tsx)

## Logs estruturados (`lib/logging/logger.ts`)

| Evento | Nível | Scope | Objetivo |
|--------|-------|-------|----------|
| `export_started` | INFO | `DashboardExport` | Início da exportação (formato pdf/csv, uid mascarado) |
| `export_completed` | INFO | `DashboardExport` | Exportação concluída com sucesso |
| `export_failed` | ERROR | `DashboardExport` | Falha na geração ou download do arquivo |

## Contexto típico

- `uid`: utilizador autenticado (mascarado)
- `format`: `pdf` ou `csv`
- `message`: erro de geração (sem dados sensíveis)

## Observações

- Exportação usa apenas `metrics` e `recentRuns` já carregados no Dashboard.
- Não dispara novas consultas Firestore nem APIs.
