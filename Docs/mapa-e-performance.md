# Mapa, Renderização e Performance

## Fluxo real (GPS → território)

1. Utilizador inicia corrida em `MapControlsOverlay` → `useRunSession` → `watchRunTrack`.
2. Pontos GPS filtrados (precisão, jitter, velocidade) em `lib/services/location-service.ts`.
3. Trilha ao vivo: `RunTrackLayer` (Polyline) em `territory-map.tsx`.
4. Ao finalizar: `createTerritoryFromRunTrack` (Turf: cleanCoords → simplify → buffer 30 m → unkink).
5. Persistência: `POST /api/runs/complete` ou `POST /api/territories/capture` (transação Firestore Admin).
6. Sincronização: `useFirestoreTerritorySync` — **uma subscrição por sessão**; filtro de viewport no cliente.

## Componentes principais

- `MapWrapper` — import dinâmico Leaflet (`ssr: false`).
- `TerritoryMap` — polígonos, trilha, marcador ao vivo; filtra territórios por `mapViewportBounds` via `useMemo`.
- `MapControlsOverlay` — iniciar/finalizar corrida, retry em falha, diálogo de conquista inimiga.

## Estado (Zustand)

- `run-store`: `points`, `livePosition`, `isRunning`, pausa por velocidade.
- `territory-store`: `territories` (lista completa do Firestore), `mapViewportBounds`, seleção.

## Otimizações

- `TerritoryPolygon`, `RunTrackLayer` com `React.memo`.
- Selectors granulares Zustand.
- Listener Firestore **não** re-subscreve em pan/zoom.
- Query Firestore: `status in [active, disputed, protected]`; opcional `geohashPrefix in [...]` após backfill.

## Configuração

- `NEXT_PUBLIC_TERRITORY_BUFFER_M` — raio do buffer em metros (default `30`).
