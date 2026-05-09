# DOC_FluxoRanking

1. [`subscribeGlobalLeaderboard`](../../lib/firebase/ranking.ts) lê `publicProfiles` ordenado por `totalAreaM2`.
2. [`useGlobalLeaderboard`](../../hooks/use-global-leaderboard.ts) para página competição global.
3. [`useLeaderboardPreview`](../../hooks/use-leaderboard-preview.ts) para dashboard home (subscrição direta quando Firebase on).

Consistência depende de escritas transacionais atualizarem `publicProfiles` ao mesmo tempo que `users`.
