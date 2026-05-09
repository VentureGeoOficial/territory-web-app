# DOC_TerritoryDomain

Não existe ficheiro `domain.ts`. A lógica de negócio de território reparte-se por:

- **Modelos e constantes:** [`types.ts`](../../lib/territory/types.ts) — `Territory`, `User`, `TrackPoint`, `RUN_TERRITORY_CONFIG`, etc.
- **Geração / interseção:** [`territory-generator.ts`](../../lib/territory/territory-generator.ts) (ver [DOC_TerritoryGenerator.md](DOC_TerritoryGenerator.md)).
- **Corrida → polígono:** [`run-territory.ts`](../../lib/territory/run-territory.ts) — `createTerritoryFromRunTrack`, `validateRunTrack`.
- **Regras de captura / custo XP:** [`geoLogic.ts`](../../lib/territory/geoLogic.ts) — `calculateCaptureImpact`, `CAPTURE_PROTECTION_MS`.
- **Limites geográficos:** [`regions.ts`](../../lib/territory/regions.ts) — Suzano bounding box (ver [DOC_Regions.md](DOC_Regions.md)).
- **Pontuação:** [`scoring.ts`](../../lib/territory/scoring.ts) — `computeXpFromRun`.

Estes módulos são usados no cliente (mapa) e no servidor (API capture) — garantir paridade de constantes (ex.: `CAPTURE_PROTECTION_MS`).
