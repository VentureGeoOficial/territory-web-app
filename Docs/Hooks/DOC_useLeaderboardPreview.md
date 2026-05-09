# DOC_useLeaderboardPreview

**Ficheiro:** [`hooks/use-leaderboard-preview.ts`](../../hooks/use-leaderboard-preview.ts)

## Assinatura

`useLeaderboardPreview(max = 8)` → `RankingEntry[]`

## Comportamento

- Se `!isFirebaseConfigured()`, lista vazia.
- Caso contrário chama **diretamente** [`subscribeGlobalLeaderboard`](../../lib/firebase/ranking.ts) (não passa pelo repositório).

## Diferença vs useGlobalLeaderboard

- Preview bypassa `getLeaderboardRepository()` e usa Firebase direto quando configurado.
