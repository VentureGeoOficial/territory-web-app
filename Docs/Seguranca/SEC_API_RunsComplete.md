# SEC_API_RunsComplete

**Rota:** [`POST /api/runs/complete`](../../app/api/runs/complete/route.ts)

## Classificação OWASP

| Área | Avaliação |
|------|-----------|
| A01 Broken Access Control | **Mitigado** — `verifyAuthOrFail` + uid só para operação no próprio utilizador |
| A02 Cryptographic Failures | Id Token não registado em logs |
| A03 Injection | Body validado com Zod |
| A04 Insecure Design | Território recalculado no servidor — cliente não envia geometria confiável isolada |
| A08 Integrity | Stats escritas só na transação Admin |

## Riscos residuais

| Risco | Severidade | Nota |
|-------|------------|------|
| Ausência de rate limit server | **MÉDIO** | Abuso autenticado — roadmap Upstash / middleware |
| Carga Firestore `queryTerritoriesForGameplay` | **MÉDIO** | Filtra por `status in (...)` — exclui `expired`; monitorizar custos |

## Logs

Ver [`Docs/Firebase/DOC_route_runs_complete.md`](../Firebase/DOC_route_runs_complete.md).

## Data da análise

2026-05-09
