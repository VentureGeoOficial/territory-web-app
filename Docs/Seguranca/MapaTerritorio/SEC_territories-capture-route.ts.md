# SEC — territories/capture/route.ts

## Vulnerabilidade corrigida — read-after-write na transação

**Severidade:** MÉDIO  
**Data da análise:** 2026-06-03

**Descrição:** `executeCaptureTransaction` executava `trx.get(users/{victimUid})` dentro do loop de overlaps **após** `trx.update`/`trx.set` em territórios e eventos. Firestore exige todas as leituras antes de todas as escritas numa transação.

**Trecho afetado (antes da correção):** `lib/firebase/transactions.ts` ~L263–291.

**Risco:** Toda captura com `partial_shrink` ou `full_expire` falhava com *"Firestore transactions require all reads to be executed before all writes"* — rollback total (corrida, território, XP não gravados).

**Correção aplicada:**
- Removidas leituras/escritas de notificações de dentro da transação.
- Notificações movidas para `sendCaptureNotifications` em [`lib/firebase/admin-capture-notifications.ts`](../../lib/firebase/admin-capture-notifications.ts).
- Falhas de notificação registadas em log; não afetam resposta 200 da API.

---

## Rate limit e payload

**Severidade:** MÉDIO (mitigado)

**Problema:** Flood e payload grande (`routeJson` até 400 KB).

**Correção:** Rate-limit partilhado + validação Zod + auth Bearer.

**Data:** 2026-05-19
