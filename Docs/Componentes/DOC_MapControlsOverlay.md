# DOC_MapControlsOverlay

**Ficheiro:** [`components/map/map-controls.tsx`](../../components/map/map-controls.tsx)

Controle da corrida GPS e captura hostil:

- Usa `useRunSession`, `useRunStore`, `useAuthStore`, `useTerritoryStore`.
- Finalizar corrida: validação domínio (`createTerritoryFromRunTrack`), `submitCompletedRunViaApi` → `POST /api/runs/complete`, ou **captura** com `submitTerritoryCaptureViaApi` quando há sobreposição inimiga elegível.
- Banner quando `isPausedDueToSpeed` (limite **24 km/h** média + precisão). Temporizador corrige pausas (`accumulatedSpeedPauseMs`).
- `CaptureXpDialog` para confirmar custo/ganho XP.
- Toast Sonner para feedback.
- Aviso se Firebase não configurado (banner âmbar).

**Crítico:** precisa de `accessToken` na store para Authorization header.
