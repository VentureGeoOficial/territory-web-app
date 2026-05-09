# DOC_useRunSession

**Ficheiro:** [`hooks/use-run-session.ts`](../../hooks/use-run-session.ts)

## Retorno

`{ permission, setPermission, isRunning, startRun, cancelRun, stopWatching }`

## `startRun`

- `startRun()` na store, `setMapMode('run')`.
- Inicia `watchFilteredTrack` com limites anti-fraude (intervalo 1500ms, distância 6m, accuracy 65m, velocidade max 9 m/s).
- Em cada ponto: `appendTrackPoint`, `setLivePosition`, `setCurrentUserPosition`.

## `cancelRun`

- Para watch, `resetRunState()`, `setMapMode('view')`.

## Cleanup

- `useEffect` unmount → `stopWatching()`.
