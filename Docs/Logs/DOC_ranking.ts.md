# DOC_ranking.ts

**Origem:** [`lib/firebase/ranking.ts`](../../lib/firebase/ranking.ts)  
**Helper de formatação:** [`formatXp`](../../lib/territory/geo.ts) em `lib/territory/geo.ts`

## Logs estruturados (`lib/logging/logger`)

| Evento | Nível | Quando | Campos |
|--------|-------|--------|--------|
| `leaderboard_updated` | INFO | Primeiro snapshot bem-sucedido por subscrição | `scope: RankingService`, `count`, `source` |
| `leaderboard_invalid_xp` | WARNING | `xp` no doc não é número finito | `userId` (mascarado), `raw` (tipo) |
| `leaderboard_subscribe_failed` | ERROR | Falha no `onSnapshot` (ex.: índice em falta) | `message`, `source` |

## Objetivo

Rastrear falhas de query do ranking, dados legados corrompidos e confirmação de carga inicial — sem registar tokens, emails completos ou payloads de perfil.

## Destino

Console do browser (JSON via `logger.ts`). Sem persistência adicional.
