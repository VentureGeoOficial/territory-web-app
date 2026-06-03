# DOC_NotificationCenter

**Rota:** `/notificacoes`  
**Acesso:** sino no [`Header`](../../components/layout/header.tsx)

## Componentes

| Componente | Ficheiro |
|------------|----------|
| `NotificationBell` | `components/notifications/notification-bell.tsx` |
| `NotificationFilterTabs` | `components/notifications/notification-filter-tabs.tsx` |
| `NotificationList` | `components/notifications/notification-list.tsx` |
| `NotificationListItem` | `components/notifications/notification-list-item.tsx` |

## Hooks

| Hook | Função |
|------|--------|
| `useNotificationInbox` | Lista paginada (20 + carregar mais) |
| `useUnreadNotificationCount` | Badge no sino (últimas 50) |
| `useNotificationsListener` | Toast para novas notificações |
| `useWelcomeNotificationOnce` | Boas-vindas idempotente na central |

## Comportamento

- Abrir central **não** marca notificações como lidas
- Clicar num item → `PATCH /api/notifications/{id}/read` + navegação (`metadata.href`)
- Filtros por categoria (client-side na v1)
- Toasts mantidos para entrega imediata

## Logs

Ver [`DOC_notifications.md`](../Services/DOC_notifications.md) e [`DOC_admin-notifications.md`](../Services/DOC_admin-notifications.md).
