# SEC — Central de Notificações

**Data:** 2026-06-03

## Controles

| Risco | Severidade | Mitigação |
|-------|------------|-----------|
| Cliente escrever notificações falsas | ALTO | Rules: `create/update/delete: false` em `users/{uid}/notifications` |
| Marcar lida de outro utilizador | ALTO | `PATCH /read` valida token → `uid` dono do doc |
| Promo admin abusivo | MÉDIO | API promo **não implementada** na v1 |
| Enumeração de IDs | BAIXO | IDs opacos; 404 se não existir ou não for do user |

## PATCH `/api/notifications/[id]/read`

- Autenticação Bearer obrigatória
- Só actualiza `read` + `readAt` no doc do utilizador autenticado
- Log `NotificationReadApi.marked_read`

## Cloud Functions

- `onFriendRequestCreated` — valida `status === pending'`
- `notifyExpiredProtection` — doc id fixo evita duplicatas; janela 20 min

## Dados sensíveis

Logs usam prefixos de uid (`slice(0, 8)`). Sem tokens nem emails nas notificações.
