# SEC_API_FriendsLookup

**Rota:** [`POST /api/friends/lookup`](../../app/api/friends/lookup/route.ts)

## Classificação OWASP

| Área | Avaliação |
|------|-----------|
| A01 Broken Access Control | Apenas utilizadores autenticados; Admin resolve email/username sem expor lista |
| A03 Injection | Email/username normalizados; username validado por regex |
| A07 Identification / Abuse | Enumeração de contas possível — mitigar com rate limit servidor |

## Logs

[`Docs/Firebase/DOC_route_friends_lookup.md`](../Firebase/DOC_route_friends_lookup.md)

## Data

2026-05-09
