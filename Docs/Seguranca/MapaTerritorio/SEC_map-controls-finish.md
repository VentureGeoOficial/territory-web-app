# SEC_map-controls-finish

**Data da análise:** 2026-06-03  
**Ficheiros:** [`components/map/map-controls.tsx`](../../../components/map/map-controls.tsx), [`components/map/capture-xp-dialog.tsx`](../../../components/map/capture-xp-dialog.tsx), [`components/map/capture-emoji-dialog.tsx`](../../../components/map/capture-emoji-dialog.tsx)

## Problema identificado

| Descrição | Severidade |
|-----------|------------|
| Diálogos de captura (`AlertDialog` `z-50`) renderizavam atrás do CTA de corrida (`z-[1000]`), impedindo conclusão visível do fluxo de conquista sobre amigo | **MÉDIO** (UX / disponibilidade funcional; sem bypass de auth) |
| Falha de `ensureReadyForApiSave` após `stopWatching` deixava `isRunning === true` sem GPS | **BAIXO** (estado inconsistente; sem vazamento de dados) |

## Risco associado

Utilizador com sobreposição de território de amigo não conseguia completar a corrida; possível abandono do fluxo ou tentativas repetidas à API sem feedback claro.

## Correção aplicada

- `zModal` (`z-[2000]`) em overlay e conteúdo dos diálogos de captura.
- `pauseRunKeepTrack()` quando a sessão não está pronta para API.
- Pré-validação `validateRunTrack` antes de parar o GPS; mensagens via toast e `lastFinishError`.
- Logs estruturados em `MapControlsOverlay` (sem dados sensíveis).

## Trecho relevante

Diálogos passam `overlayClassName` e `className` com `zModal` via `AlertDialogContent` (`components/ui/alert-dialog.tsx`).
