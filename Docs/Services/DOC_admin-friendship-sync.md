# DOC_admin-friendship-sync

**Módulo:** [`lib/firebase/admin-friendship-sync.ts`](../lib/firebase/admin-friendship-sync.ts)  
**API:** [`POST /api/friends/accept`](../app/api/friends/accept/route.ts)

## Objetivo

Sincronizar o grafo `friendships/{uid}/list/{friendUid}` quando um pedido de amizade é aceite, sem depender exclusivamente da Cloud Function.

## Logs adicionados

| Evento | Nível | Origem | Contexto |
|--------|-------|--------|----------|
| `accept_request_start` | INFO | AdminFriendshipSync | uid, requestIdPrefix |
| `accept_request_completed` | INFO | AdminFriendshipSync | uid, from/to prefix, requestIdPrefix |
| `accept_request_idempotent` | INFO | AdminFriendshipSync | retry em pedido já accepted |
| `friendship_edge_created` | INFO | AdminFriendshipSync | from/to prefix, requestIdPrefix |
| `friendship_edge_skipped_invalid_users` | WARNING | AdminFriendshipSync | requestIdPrefix |
| `request_start` | INFO | FriendsAcceptApi | uid, requestIdPrefix |
| `request_completed` | INFO | FriendsAcceptApi | uid, friendCount, alreadyAccepted |
| `accept_rejected` | WARNING | FriendsAcceptApi | status HTTP, message |
| `accept_failed` | ERROR | FriendsAcceptApi | message (sem tokens) |

## Local de gravação

Stdout JSON estruturado via [`lib/logging/logger.ts`](../lib/logging/logger.ts) — Cloud Logging em produção (Vercel/Firebase).

## Data

2026-05-29
