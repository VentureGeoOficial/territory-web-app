# DOC_LocationService

**Ficheiro:** [`lib/services/location-service.ts`](../../lib/services/location-service.ts)

## Funções

| Função | Objetivo |
|--------|----------|
| `probeGeolocationPermission()` | `navigator.permissions.query({ name: 'geolocation' })` → granted/denied/prompt/unsupported |
| `getCurrentPositionOnce(options?)` | Wrapper Promise sobre `getCurrentPosition` |
| `watchFilteredTrack(opts)` | `watchPosition` com filtros anti-ruído: intervalo mínimo, distância mínima, `maxAccuracyM`, `maxSpeedMps` (anti-trapaça leve) |
| `watchRunTrack(opts)` | Rastreio durante **corrida**: integra [`SpeedGate`](DOC_speed-gate.ts.md) — média móvel da velocidade, pausa registos acima de 24 km/h; `gate.paused` interrompe `onPoint`; `onLivePosition` com throttle se pausa |
| `clearWatch(id)` | `clearWatch` |

## Observabilidade (`watchRunTrack`)

- `console.info` em transição `SpeedGate`: `transition` (`enter` \| `exit`), `paused`, `functionality`: `watchRunTrack`, `source`: `lib/services/location-service.ts`. Sem GPS nem PII.

## Dependências internas

- `haversineDistance` — [`lib/territory/geo.ts`](../../lib/territory/geo.ts)
- Tipo `TrackPoint` — [`lib/territory/types.ts`](../../lib/territory/types.ts)

## Consumidores

- [`hooks/use-user-position-tracking.ts`](../../hooks/use-user-position-tracking.ts)
- [`hooks/use-run-session.ts`](../../hooks/use-run-session.ts) — **corrida** via `watchRunTrack`
- [`components/map/map-controls.tsx`](../../components/map/map-controls.tsx)
