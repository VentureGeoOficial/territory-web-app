# DOC_MapControlsOverlay

**Ficheiro:** [`components/map/map-controls.tsx`](../../components/map/map-controls.tsx)

Controle da corrida GPS e captura hostil:

- Usa `useRunSession`, `useRunStore`, `useAuthStore`, `useTerritoryStore`.
- Finalizar corrida: pré-validação (`validateRunTrack` antes de parar GPS), depois `createTerritoryFromRunTrack`, `submitCompletedRunViaApi` → `POST /api/runs/complete`, ou **captura** com `submitTerritoryCaptureViaApi` quando há sobreposição inimiga elegível.
- Banner quando `isPausedDueToSpeed` (limite **24 km/h** média + precisão). Temporizador corrige pausas (`accumulatedSpeedPauseMs`).
- `CaptureXpDialog` / `CaptureEmojiDialog` com `z-[2000]` (`zModal`) para ficarem acima do CTA fixo (`z-[1000]`).
- Toast Sonner + banner âmbar `lastFinishError` no modo percurso pendente (`hasPendingTrack`).
- Aviso se Firebase não configurado (banner âmbar).
- CTA **Iniciar corrida** / barra de corrida: `position: fixed` com offset `3.5rem + safe-area` acima da bottom nav (`z-[1000]`).
- Percurso pendente após falha ao finalizar: mensagem de erro persistente + **Finalizar corrida** + **Encerrar corrida**.
- Âncora onboarding: `id="tour-run-cta"`, `data-tour="run-cta"`.

## Logs

| Evento | Nível | Objetivo |
|--------|-------|----------|
| `finish_validation_fail` | WARNING | Pré-validação do percurso falhou (pontos, distância, tempo, Suzano) |
| `finish_capture_blocked` | WARNING | Sobreposição com amigo mas território protegido |
| `finish_capture_dialog` | INFO | Fluxo de conquista inimiga (diálogo XP) |
| `finish_auth_not_ready` | WARNING | Sessão Firebase indisponível antes do POST |
| `finish_api_ok` | INFO | Corrida gravada com sucesso |
| `finish_api_fail` | WARNING | Erro ao salvar (validação, API, rede) |

Contexto: `scope: MapControlsOverlay`, `source: components/map/map-controls.tsx`, `pointCount`, `distanceMeters`, `durationSeconds`, `uid` (mascarado pelo logger). Sem tokens nem coordenadas completas.

**Crítico:** precisa de sessão Firebase válida (`getApiAuthHeaders`) para Authorization header.
