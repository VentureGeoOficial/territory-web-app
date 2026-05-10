# DOC_speed-gate.ts

**Ficheiro:** [`lib/services/speed-gate.ts`](../../lib/services/speed-gate.ts)

## Objetivo

Anti-cheat de velocidade **sem** `if (v > 24)` directo: buffer dos últimos `N` instantes de velocidade derivados por Haversine ÷ Δt, **média móvel**, histerese (entrada a 24 km/h, saída a 23 km/h), amostras com `accuracy` acima do limite ignoradas no serviço de localização, saltos > 45 m/s ignorados para a média.

## API

- `new SpeedGate({ maxAccuracyM, windowSize?, consecutiveRequired? })`
- `evaluate(tp: TrackPoint)` → `{ transition, meanMps, skippedTeleport }`
- `reset()` — nova corrida

## Constantes exportadas

- `MAX_RUN_SPEED_KMH` = 24  
- `SPEED_GATE_WINDOW_SIZE`, `SPEED_GATE_CONSECUTIVE_SAMPLES`
