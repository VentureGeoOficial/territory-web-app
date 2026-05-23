# Logs — POST /api/territories/capture

| Evento | Nível | Campos |
|--------|-------|--------|
| request_start | INFO | uid, runIdPrefix |
| success | INFO | uid, territoryId, victimOutcomeCount, partialShrinkCount |
| failure | ERROR | message |

Local: `app/api/territories/capture/route.ts`.

Transação de captura parcial: ver [`DOC_territory-capture-partial.md`](./DOC_territory-capture-partial.md).
