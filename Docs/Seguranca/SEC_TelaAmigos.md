# SEC_TelaAmigos

**Tela:** [`/amigos`](../../app/(authenticated)/amigos/page.tsx)  
**Serviços:** [`lib/firebase/friends.ts`](../../lib/firebase/friends.ts), [`lib/services/friends-service.ts`](../../lib/services/friends-service.ts), [`POST /api/friends/lookup`](../../app/api/friends/lookup/route.ts)

## Revisão OWASP (resumo)

| ID | Tema | Avaliação |
|----|------|-----------|
| A01 | Pedidos e documentos `friendRequests` — apenas remetente/destinatário nas rules | OK — sem mudança nesta entrega |
| A03 | Username: regex cliente + servidor (`^[a-z0-9_]{3,20}$`) | OK |
| A04 | Duplicados: validação cliente + query antes de `addDoc` | Risco residual **BAIXO** (corrida entre clientes) |
| A07 | Lookup por slug público em vez de e-mail na UI | Melhoria vs enumeração por e-mail |
| A09 | Logs cliente INFO sem PII (prefixos 8 chars) | OK — ver [DOC_FriendsService.md](../Services/DOC_FriendsService.md) |

## Data

2026-05-10
