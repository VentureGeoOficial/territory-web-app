# SEC_export-report

**Data da análise:** 2026-06-05  
**Módulo:** `lib/dashboard/export-report.ts`, `components/dashboard/dashboard-export-button.tsx`

## Resumo

Exportação somente leitura dos dados já exibidos no Dashboard do próprio utilizador. Risco: **BAIXO**.

## Verificações

| Vetor | Status |
|-------|--------|
| Autenticação | Botão disponível apenas na rota `(authenticated)` com dados do `uid` atual |
| Autorização | Usa `metrics`/`recentRuns` provenientes de `useDashboardMetrics(uid)` — sem dados de terceiros |
| Vazamento de dados | Relatório não inclui `routeJson`, email, uid bruto ou tokens |
| APIs | Nenhuma API criada ou alterada |
| XSS no arquivo | Valores numéricos formatados; CSV escapa aspas e quebras de linha |
| Logs | uid mascarado; sem conteúdo do relatório nos logs |

## Correções aplicadas

- Exportação restrita ao estado já carregado no cliente (sem novas queries).
- Escape de valores CSV para evitar injeção em planilhas.
- Botão oculto em loading, erro e estado vazio.

## Melhorias futuras

- Assinatura digital ou hash do relatório para auditoria
- Limite de taxa por sessão para evitar spam de downloads
