# SEC_RateLimiting

## Cliente

[`useRateLimit`](../../hooks/use-rate-limit.ts) — limita tentativas em login/cadastro/pedidos.

**Severidade:** **BAIXO** como controlo real — qualquer cliente pode ignorar o hook ou chamar API diretamente.

## Servidor

**Não há** rate limiting nas rotas [`capture`](../../app/api/territories/capture/route.ts), [`runs/complete`](../../app/api/runs/complete/route.ts), [`friends/lookup`](../../app/api/friends/lookup/route.ts), nem [`resolve-identifier`](../../app/api/auth/resolve-identifier/route.ts) — último endpoint público para enumeração controlada.

Recomendação: Vercel Firewall, Cloudflare, ou quota Firebase App Check + limites na função / edge middleware.
