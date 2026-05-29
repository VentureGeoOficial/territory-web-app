# SEC — Captura apenas entre amigos

**Data:** 2026-05-28  
**Nível:** Alto (controle de acesso social)

## Regra

Captura hostil (`POST /api/territories/capture`) só afeta territórios cujo `userId` está em `friendships/{attackerUid}/list/*`.

## Implementação

- `lib/firebase/admin-friendship.ts` — fonte da verdade server-side
- `lib/territory/geoLogic.ts` — overlap filtrado por `friendOwnerIds`
- `lib/firebase/transactions.ts` — `NOT_FRIEND` se vítima não for amiga
- Estranhos: overlap geográfico permitido sem bloqueio em `/api/runs/complete`

## Risco mitigado

Bypass via API direta contra não-amigos → `403 NOT_FRIEND`.

## Correção

Validação em route + transação; client alinhado via `useFriendIds`.
