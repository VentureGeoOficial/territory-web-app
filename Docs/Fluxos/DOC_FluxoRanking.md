# DOC_FluxoRanking

1. [`subscribeGlobalLeaderboard`](../../lib/firebase/ranking.ts) lê `publicProfiles` ordenado por **`xp`** (desc).
2. [`useGlobalLeaderboard`](../../hooks/use-global-leaderboard.ts) para página `/competicao` (global).
3. [`useLeaderboardPreview`](../../hooks/use-leaderboard-preview.ts) para prévia na home autenticada (`/`).
4. Tab **Amigos** em `/competicao`: filtra o top global a `{ eu } ∪ amigos` e reordena no cliente por `xp`, desempate `territoriesCount` e nome.

Consistência depende de escritas transacionais atualizarem `publicProfiles.xp` ao mesmo tempo que `users.xp`. Área dominada (`totalAreaM2`) não entra na ordenação do ranking.
