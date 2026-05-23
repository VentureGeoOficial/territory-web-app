# DOC_territory-capture-partial

**Módulos:** [`lib/territory/territory-generator.ts`](../../lib/territory/territory-generator.ts) (`subtractPolygonOverlap`), [`lib/firebase/transactions.ts`](../../lib/firebase/transactions.ts) (`executeCaptureTransaction`)

## Objetivo dos logs

Rastrear invasão parcial vs conquista total sem registrar coordenadas GPS ou `polygonJson` completo.

## Eventos

| Evento | Nível | Origem | Campos |
|--------|-------|--------|--------|
| `capture_victim_partial_shrink` | INFO | `TerritoryCaptureTransaction` | `territoryId`, `victimUidPrefix`, `lostAreaM2`, `remainderAreaM2` |
| `capture_victim_full_expire` | INFO | `TerritoryCaptureTransaction` | `territoryId`, `victimUidPrefix`, `lostAreaM2` |
| `capture_difference_failed` | WARNING | `TerritoryCaptureTransaction` | `territoryId`, `victimUidPrefix` |

A API [`app/api/territories/capture/route.ts`](../../app/api/territories/capture/route.ts) em `success` inclui `victimOutcomeCount` e `partialShrinkCount`.

## Regra de negócio

- Invasão parcial: `turf.difference` + update do doc da vítima (mesmo `userId`, polígono menor).
- Conquista total: `status: expired` quando restante &lt; `MIN_REMAINDER_AREA_M2` (50 m²).
- XP da vítima não é alterado na captura.
