# DOC_Scoring

**Ficheiro:** [`lib/territory/scoring.ts`](../../lib/territory/scoring.ts)

- `computeXpFromRun(distanceM, areaM2)` — mínimo 50 XP; combina distância (2 XP/100m) e área (1 XP/100m², mínimo 50 da componente de área).

Alinhado com regras de transação em Firestore (ganhos mínimos noutros sítios — manter coerente).
