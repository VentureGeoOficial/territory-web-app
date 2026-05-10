# DOC_useRunSession

**Ficheiro:** [`hooks/use-run-session.ts`](../../hooks/use-run-session.ts)

## Retorno

`{ permission, setPermission, isRunning, startRun, cancelRun, stopWatching }`

## `startRun`

- `startRun()` na store, `setMapMode('run')`.
- Instancia [`SpeedGate`](../../lib/services/speed-gate.ts) (accuracy máx 65 m) e inicia [`watchRunTrack`](../../lib/services/location-service.ts) (intervalo 1500 ms, distância 6 m, accuracy 65 m).
- `onSpeedPauseChange` → [`setSpeedPaused`](../../lib/store/run-store.ts) (`isPausedDueToSpeed`): em pausa **não** há `appendTrackPoint`/`distância` (delegado ao `watchRunTrack`).
- Em cada ponto aceite: `appendTrackPoint`, posição ao vivo; em pausa, só marcador espaçado.

## `cancelRun`

- Para watch, `resetRunState()`, `setMapMode('view')`.

## Cleanup

- `useEffect` unmount → `stopWatching()`.
