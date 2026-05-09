# DOC_TerritoryGeoLogic

**Ficheiro:** [`lib/territory/geoLogic.ts`](../../lib/territory/geoLogic.ts)

- `CAPTURE_PROTECTION_MS` — 3h (consistente com produto).
- `calculateCaptureImpact`, `xpCostFromOverlappingAreaM2`, `hasEnemyCaptureOverlap` — regra custo 10 XP + 1 XP por 10 m² sobrepostos.
- Tipos `CaptureImpactOk` / bloqueio por proteção.

Usado em [`map-controls`](../../components/map/map-controls.tsx) e [`capture/route`](../../app/api/territories/capture/route.ts).
