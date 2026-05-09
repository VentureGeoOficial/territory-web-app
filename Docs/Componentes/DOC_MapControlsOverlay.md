# DOC_MapControlsOverlay

**Ficheiro:** [`components/map/map-controls.tsx`](../../components/map/map-controls.tsx)

Controle da corrida GPS e captura hostil:

- Usa `useRunSession`, `useRunStore`, `useAuthStore`, `useTerritoryStore`.
- Finalizar corrida: validação domínio (`createTerritoryFromRunTrack`), `submitCompletedRunViaApi` → `POST /api/runs/complete`, ou fluxo de **captura** com `fetch('/api/territories/capture', { Authorization: Bearer idToken })` quando há sobreposição inimiga elegível.
- `CaptureXpDialog` para confirmar custo/ganho XP.
- Toast Sonner para feedback.
- Aviso se Firebase não configurado (banner âmbar).

**Crítico:** precisa de `accessToken` na store para Authorization header.
