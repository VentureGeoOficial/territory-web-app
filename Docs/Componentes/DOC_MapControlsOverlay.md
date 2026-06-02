# DOC_MapControlsOverlay

**Ficheiro:** [`components/map/map-controls.tsx`](../../components/map/map-controls.tsx)

Controle da corrida GPS e captura hostil:

- Usa `useRunSession`, `useRunStore`, `useAuthStore`, `useTerritoryStore`.
- Finalizar corrida: validação domínio (`createTerritoryFromRunTrack`), `submitCompletedRunViaApi` → `POST /api/runs/complete`, ou **captura** com `submitTerritoryCaptureViaApi` quando há sobreposição inimiga elegível.
- Banner quando `isPausedDueToSpeed` (limite **24 km/h** média + precisão). Temporizador corrige pausas (`accumulatedSpeedPauseMs`).
- `CaptureXpDialog` para confirmar custo/ganho XP.
- Toast Sonner para feedback.
- Aviso se Firebase não configurado (banner âmbar).
- CTA **Iniciar corrida** / barra de corrida: `position: fixed` com offset `3.5rem + safe-area` acima da bottom nav (`z-[1000]`).
- Percurso pendente após falha ao finalizar: **Finalizar corrida** + **Encerrar corrida** (sem botão «Tentar novamente»).
- Âncora onboarding: `id="tour-run-cta"`, `data-tour="run-cta"`.

## Logs

Sem logs adicionais neste overlay (erros de API continuam em toast + `console.error` existente).

**Crítico:** precisa de `accessToken` na store para Authorization header.
