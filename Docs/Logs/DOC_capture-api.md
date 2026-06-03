# Logs — POST /api/territories/capture

| Evento | Nível | Campos |
|--------|-------|--------|
| request_start | INFO | uid, runIdPrefix |
| success | INFO | uid, territoryId, victimOutcomeCount, partialShrinkCount |
| notification_failed | WARN | uid, runIdPrefix, message |
| failure | ERROR | message |

Local: `app/api/territories/capture/route.ts`.

Notificações pós-transação: ver [`DOC_notifications.md`](../Services/DOC_notifications.md).

Transação de captura parcial: ver [`DOC_territory-capture-partial.md`](./DOC_territory-capture-partial.md).
