# DOC_useUserPositionTracking

**Ficheiro:** [`hooks/use-user-position-tracking.ts`](../../hooks/use-user-position-tracking.ts)

## Assinatura

`export function useUserPositionTracking()` → `{ startTracking, stopTracking }`

## Comportamento

- Usa `useRunStore`: `permission`, `setPermission`, `setCurrentUserPosition`, `setIsTrackingPosition`, `isRunning`.
- Ao montar: `probeGeolocationPermission()` — se `granted`, chama `startTracking()` que usa `navigator.geolocation.watchPosition` (não filtrado).
- Cleanup ao desmontar: `stopTracking()` → `clearWatch`.
- Efeito adicional: se `permission === 'granted'` e não há watch e não está em corrida, reinicia tracking.

## Riscos

- Dois sistemas de geo: este hook e `useRunSession` — podem coexistir; `useRunSession` usa track filtrado durante corrida.
