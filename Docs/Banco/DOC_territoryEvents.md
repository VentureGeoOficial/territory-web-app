# Territory events (`territories/{id}/events`)

Subcoleção aditiva registada **apenas em capturas hostis** sobre amigos.

## Schema (`TerritoryEventDoc`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `type` | `capture_partial` \| `capture_full` | Tipo de alteração |
| `at` | number | Timestamp ms |
| `actorUid` | string | Atacante |
| `runId` | string | Corrida associada |
| `lostAreaM2` | number | Área perdida pela vítima |
| `remainderAreaM2` | number? | Restante após shrink parcial |
| `reactionEmoji` | string? | Emoji enviado pelo atacante |

## Logs

Escrita em `lib/firebase/transactions.ts` — eventos `capture_victim_partial_shrink` e `capture_victim_full_expire` mantidos no logger estruturado.
