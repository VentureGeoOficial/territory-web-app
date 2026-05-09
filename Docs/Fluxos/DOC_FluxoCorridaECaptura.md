# DOC_FluxoCorridaECaptura

```mermaid
flowchart TD
  Start[useRunSession.startRun] --> Watch[watchFilteredTrack GPS]
  Watch --> Points[appendTrackPoint run-store]
  Stop[Utilizador para corrida] --> Build[createTerritoryFromRunTrack]
  Build --> Suzano{Dentro Suzano?}
  Suzano -->|não| ErrArea[erro área]
  Suzano -->|sim| Overlap{calculateCaptureImpact}
  Overlap -->|sem overlap inimigo| SaveRun[POST /api/runs/complete Admin trx]
  Overlap -->|overlap| Dialog[CaptureXpDialog]
  Dialog --> API[POST /api/territories/capture Bearer token]
  API --> AdminTrx[executeCaptureTransaction Admin]
```

Dois caminhos de persistência: **corrida normal** (`POST /api/runs/complete`) vs **captura hostil** (`POST /api/territories/capture`) — ambos Admin SDK; o cliente não escreve `territories`/`runs`/stats.
