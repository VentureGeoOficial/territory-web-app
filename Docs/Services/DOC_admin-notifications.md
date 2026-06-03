# DOC_admin-notifications

**Ficheiro:** [`lib/firebase/admin-notifications.ts`](../../lib/firebase/admin-notifications.ts)  
**Escopo:** `server-only`

## `createUserNotification(input)`

Writer central para `users/{uid}/notifications`.

| Campo | Descrição |
|-------|-----------|
| `uid` | Destinatário |
| `type` | Discriminador (`territory_captured`, `friend_request_received`, …) |
| `title`, `message` | Texto exibido na central |
| `docId` | Opcional — idempotência |
| `metadata` | Dados extras (`href`, `territoryId`, …) |

Respeita `notificationPreferences.app`. Falhas → `log.warn`, retorna `null`.

## Helpers

| Função | Evento |
|--------|--------|
| `notifyFriendRequestReceived` | Pedido de amizade |
| `notifyFriendRequestAccepted` | Pedido aceite |
| `notifyTerritoryUnprotected` | Proteção expirada (dono) |
| `resolveDisplayName` | Nome para mensagens |

## Logs

| Evento | Nível |
|--------|-------|
| `notification_created` | INFO |
| `notification_create_failed` | WARN |

Cloud Functions espelham schema em `functions/src/notifications.ts`.
