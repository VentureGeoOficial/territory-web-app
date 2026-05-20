# Logs — POST /api/runs/complete

| Evento | Nível | Campos |
|--------|-------|--------|
| request_start | INFO | uid, runIdPrefix, pointCount |
| idempotent_hit | INFO | uid, runIdPrefix |
| validation_failed | WARNING | uid, message |
| success | INFO | uid, territoryId, areaM2 |
| failure | ERROR | message |

Local: `lib/logging/logger.ts` via `log.*` em `app/api/runs/complete/route.ts`.
