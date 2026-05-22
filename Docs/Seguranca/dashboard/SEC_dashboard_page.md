# SEC_dashboard_page

**Data da análise:** 2026-05-20  
**Módulo:** `app/(authenticated)/dashboard/*`, `components/dashboard/*`, `lib/dashboard/*`, `lib/firebase/dashboard-runs.ts`

## Resumo

Leitura isolada de métricas do próprio utilizador. Risco: **BAIXO**.

## Verificações

| Vetor | Status |
|-------|--------|
| Autenticação | Rota em `(authenticated)` + `AuthGuard` |
| Autorização Firestore | Query `userId == uid`; rules `runs` owner read |
| Vazamento de dados | Sem exposição de `routeJson` na UI v1 |
| Logs | Agregados apenas; uid mascarado |
| XSS | Dados numéricos formatados; datas via `date-fns` |

## Isolamento

- Não altera APIs de corrida/captura, `run-store`, mapa ou loja.
- Subscrição dedicada em `dashboard-runs.ts` (somente leitura).

## Melhorias futuras

- API server-side para paginação e ocultar campos brutos
- Rate limit em leituras massivas de `runs`
