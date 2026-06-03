# Notificações in-app (`users/{uid}/notifications`)

## Schema (`TerritoryCapturedNotificationDoc`)

| Campo | Tipo |
|-------|------|
| `type` | `territory_captured` |
| `createdAt` | number |
| `readAt` | number? |
| `actorUid`, `actorName` | string |
| `attackerTerritoryId`, `victimTerritoryId` | string |
| `mode` | `partial_shrink` \| `full_expire` |
| `lostAreaM2` | number |
| `reactionEmoji` | 😀 \| 😈 \| 🏆 |
| `message` | string |

## Entrega

- Escrita: Admin SDK em `sendCaptureNotifications` ([`lib/firebase/admin-capture-notifications.ts`](../../lib/firebase/admin-capture-notifications.ts)) **após** `executeCaptureTransaction` concluir com sucesso.
- Só envia se o atacante escolheu emoji (`reactionEmoji` no body da API).
- Respeita `notificationPreferences.app` da vítima.
- Falhas de notificação são registadas com `log.warn` e **nunca** revertem a conquista.
- Leitura: client via `hooks/use-notifications.ts` + toast Sonner.
- Rules: `users/{userId}/notifications/{id}` — read owner only; writes denied.

## Logs

| Evento | Nível | Origem |
|--------|-------|--------|
| `notification_sent` | INFO | `CaptureNotifications` |
| `notification_failed` | WARN | `CaptureNotifications` ou `TerritoryCaptureApi` |

Notificações não expõem tokens nem dados sensíveis.
