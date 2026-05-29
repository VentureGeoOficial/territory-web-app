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

- Escrita: Admin SDK em `executeCaptureTransaction` (respeita `notificationPreferences.app`).
- Leitura: client via `hooks/use-notifications.ts` + toast Sonner.
- Rules: `users/{userId}/notifications/{id}` — read owner only; writes denied.

## Logs

`TerritoryCaptureTransaction` regista outcomes; notificações não expõem tokens nem dados sensíveis.
