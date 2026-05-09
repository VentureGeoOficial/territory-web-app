# DOC_LocationService

**Ficheiro:** [`lib/services/location-service.ts`](../../lib/services/location-service.ts)

## Funções

| Função | Objetivo |
|--------|----------|
| `probeGeolocationPermission()` | `navigator.permissions.query({ name: 'geolocation' })` → granted/denied/prompt/unsupported |
| `getCurrentPositionOnce(options?)` | Wrapper Promise sobre `getCurrentPosition` |
| `watchFilteredTrack(opts)` | `watchPosition` com filtros anti-ruído: intervalo mínimo, distância mínima, `maxAccuracyM`, `maxSpeedMps` (anti-trapaça leve) |
| `clearWatch(id)` | `clearWatch` |

## Dependências internas

- `haversineDistance` — [`lib/territory/geo.ts`](../../lib/territory/geo.ts)
- Tipo `TrackPoint` — [`lib/territory/types.ts`](../../lib/territory/types.ts)

## Consumidores

- [`hooks/use-user-position-tracking.ts`](../../hooks/use-user-position-tracking.ts)
- [`hooks/use-run-session.ts`](../../hooks/use-run-session.ts)
- [`components/map/map-controls.tsx`](../../components/map/map-controls.tsx)
