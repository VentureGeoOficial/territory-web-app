# DOC_FluxoCorridaECaptura

```mermaid
flowchart TD
  Start[useRunSession.startRun] --> Watch[watchRunTrack + SpeedGate 24kmh]
  Watch --> Points[appendTrackPoint se nao pausado]
  Stop[Utilizador para corrida] --> Build[createTerritoryFromRunTrack]
  Build --> Suzano{Dentro Suzano?}
  Suzano -->|não| ErrArea[erro área]
  Suzano -->|sim| Overlap{calculateCaptureImpact}
  Overlap -->|sem overlap inimigo| SaveRun[POST /api/runs/complete Admin trx]
  Overlap -->|overlap| Dialog[CaptureXpDialog]
  Dialog --> API[submitTerritoryCaptureViaApi]
  API --> AdminTrx[executeCaptureTransaction Admin]
```

Dois caminhos de persistência: **corrida normal** (`submitCompletedRunViaApi` → `POST /api/runs/complete`) vs **captura hostil** (`submitTerritoryCaptureViaApi` → `POST /api/territories/capture`) — ambos Admin SDK; o cliente não escreve `territories`/`runs`/stats.

**Duração enviada à API**: tempo de parede menos [`accumulatedSpeedPauseMs`](../../lib/store/run-store.ts) enquanto `isPausedDueToSpeed`.

