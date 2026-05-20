# Logs — Visibilidade de territórios (só amigos)

## Objetivo

Rastrear subscrições Firestore de territórios filtrados por rede de amigos e sincronização de arestas `friendships`.

## Eventos

| Evento | Nível | Origem | Descrição |
|--------|-------|--------|-----------|
| `territory_visibility_subscribed` | INFO | `lib/firebase/territories.ts` | Início de listeners por batch (`userId in [...]`). Contexto: `uid` (mascarado), `friendCount`, `batchCount`. |
| `territory_visibility_received` | INFO | `lib/firebase/territories.ts` | Snapshot merge concluído. Contexto: `uid`, `totalDocs`, `batchCount`. |
| `territory_visibility_error` | ERROR | `lib/firebase/territories.ts` | Falha no listener (ex.: `permission-denied` após deploy de rules sem backfill). |
| `territory_sync_failed` | ERROR | `hooks/use-firestore-territory-sync.ts` | Erro propagado ao hook de sincronização. |
| `friendship_edge_created` | INFO | `functions/src/index.ts` | Arestas criadas após aceite de pedido. UIDs mascarados (8 chars). |
| `friendship_edge_removed` | INFO | `functions/src/index.ts` | Arestas removidas (transição accepted → rejected/cancelled). |
| `friendship_edge_sync_failed` | ERROR | `functions/src/index.ts` | Falha na transação Admin. |
| `friendships_backfill_*` | INFO/CRITICAL | `scripts/backfill-friendships.ts` | Progresso e falhas do backfill one-shot. |

## Segurança dos logs

- UIDs completos **não** são registados; usa-se mascaramento via `lib/logging/logger.ts` (`uid` → prefixo 8 chars + `…`).
- Sem tokens, emails completos ou geometria de polígonos nos logs.

## Local de gravação

- Cliente / API Next.js: stdout (JSON) em runtime Node ou browser console.
- Cloud Functions: Google Cloud Logging (via `console.info` / `console.error` estruturado).
