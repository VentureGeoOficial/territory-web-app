# DOC_API_TerritoriesCapture

**Ficheiro:** [`app/api/territories/capture/route.ts`](../../app/api/territories/capture/route.ts)  
**Método:** `POST` apenas

## Autenticação

- Header `Authorization: Bearer <FirebaseIdToken>`.
- `getAdminAuth().verifyIdToken(token)` → `uid`. Falha → 401, log `console.warn` sem token.

## Body (JSON) — Zod

```ts
{
  points: Array<{ latitude, longitude, timestamp, accuracy?, altitude?, speed? }>  // min 2
  startedAt: number
  endedAt: number
  distanceMeters: number  // >= 0
  durationSeconds: number  // >= 0
  routeJson: string        // max 400_000 chars
}
```

## Processamento (resumo)

1. Carrega `users/{uid}` e **toda** a coleção `territories` (Admin) — atenção a escala.
2. Constrói território a partir do track: `createTerritoryFromRunTrack` + validações Suzano, área max 10M m².
3. `calculateCaptureImpact` — se sem overlap inimigo → 400 `NO_ENEMY_OVERLAP`.
4. Se impacto negado (protegido) → 403.
5. `executeCaptureTransaction` (Admin) com XP run/custo.
6. Resposta 200: `territoryId`, `runId`, `xpCost`, `xpGain`, `totalOverlappingAreaM2`.

## Erros

- `CaptureTransactionError` → mapa de status (402, 403, 409, 400).
- Mensagem contendo config admin → 503.
- Outros → 500 + `console.error`.

## Origem da chamada

- [`components/map/map-controls.tsx`](../../components/map/map-controls.tsx) — `fetch` com token da `auth-store`.
