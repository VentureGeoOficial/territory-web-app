# Notificações in-app (`users/{uid}/notifications`)

## Schema unificado

| Campo | Tipo | Notas |
|-------|------|-------|
| `type` | enum | Ver tipos abaixo |
| `category` | territory \| friends \| system \| promo \| events | Filtro UI |
| `title` | string | Título na central |
| `message` | string | Corpo |
| `createdAt` | number | ms epoch |
| `read` | boolean | default false |
| `readAt` | number? | Ao marcar lida |
| `metadata` | object? | `href`, ids, etc. |

### Tipos (v1)

| type | category | Origem |
|------|----------|--------|
| `territory_captured` | territory | Captura com emoji |
| `territory_unprotected` | territory | CF `notifyExpiredProtection` |
| `friend_request_received` | friends | CF `onFriendRequestCreated` |
| `friend_request_accepted` | friends | API accept |
| `system_welcome` | system | POST `/api/notifications/welcome` |
| `promo_sponsor` | promo | Preparado (sem writer) |
| `event_available` | events | Preparado (sem writer) |

Docs legados `territory_captured` (campos `actorName`, `reactionEmoji`, …) continuam suportados via [`notification-presenter.ts`](../../lib/notifications/notification-presenter.ts).

## Entrega

- **Escrita:** Admin SDK — [`admin-notifications.ts`](../../lib/firebase/admin-notifications.ts)
- **Leitura:** client Firestore + central `/notificacoes`
- **Marcar lida:** `PATCH /api/notifications/{id}/read`
- **Toast:** [`hooks/use-notifications.ts`](../../hooks/use-notifications.ts)
- **Rules:** read owner; writes denied (Admin only)

## Logs

| Evento | Nível | Origem |
|--------|-------|--------|
| `notification_created` | INFO | AdminNotifications |
| `notification_create_failed` | WARN | AdminNotifications |
| `marked_read` | INFO | NotificationReadApi |
| `notification_failed` | WARN | Capture / Friends APIs |
| `welcome_sent` | INFO | NotificationWelcomeApi |

Ver [`DOC_NotificationCenter.md`](../Componentes/DOC_NotificationCenter.md).
