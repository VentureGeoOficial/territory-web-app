# DOC_admin-capture-notifications

**Ficheiro:** [`lib/firebase/admin-capture-notifications.ts`](../../lib/firebase/admin-capture-notifications.ts)  
**Escopo:** `server-only`

## `sendCaptureNotifications(input)`

Envia notificações in-app às vítimas **após** conquista bem-sucedida.

| Condição | Comportamento |
|----------|---------------|
| `reactionEmoji` ausente | Retorna imediatamente (sem notificações) |
| `notificationPreferences.app === false` | Ignora vítima |
| Erro ao gravar | `log.warn` — não propaga |

## Logs

| Evento | Nível |
|--------|-------|
| `notification_sent` | INFO |
| `notification_failed` | WARN |

Chamador: [`POST /api/territories/capture`](../../app/api/territories/capture/route.ts).
