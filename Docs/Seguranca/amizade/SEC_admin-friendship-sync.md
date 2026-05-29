# SEC_admin-friendship-sync

**Rotas:** [`POST /api/friends/accept`](../../app/api/friends/accept/route.ts)  
**Módulo:** [`lib/firebase/admin-friendship-sync.ts`](../../lib/firebase/admin-friendship-sync.ts)

## Análise OWASP

| Área | Avaliação | Severidade |
|------|-----------|------------|
| A01 Broken Access Control | Apenas destinatário (`toUserId === callerUid`) pode aceitar; token Firebase obrigatório | OK |
| A01 Escrita friendships | Cliente não escreve grafo; Admin SDK na API | OK |
| A03 Injection | `requestId` validado com Zod (string 1–128) | OK |
| A07 Abuse | Sem rate limit dedicado — aceite é baixa frequência; reutilizar rate limit futuro se necessário | BAIXO |

## Trecho crítico

Validação de autorização em `acceptFriendRequestWithGraph`:

```typescript
if (toUserId !== callerUid) {
  throw new AcceptFriendError('Sem permissão para aceitar este pedido.', 403)
}
```

## Riscos

| Risco | Nível | Mitigação |
|-------|-------|-----------|
| Aceite por utilizador não destinatário | ALTO (se ausente) | Verificação `toUserId === callerUid` |
| Dupla execução CF + API | BAIXO | `createFriendshipEdges` idempotente (`if (!exists) set`) |
| Enumeração de requestIds | BAIXO | 404 genérico; IDs opacos Firestore |

## Correção aplicada

API server-side com Admin SDK substitui aceite client-only em `friendRequests`, garantindo grafo `friendships` na mesma operação.

## Data

2026-05-29
