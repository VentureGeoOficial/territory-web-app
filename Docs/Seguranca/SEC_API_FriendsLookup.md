# SEC_API_FriendsLookup

**Rota:** [`POST /api/friends/lookup`](../../app/api/friends/lookup/route.ts)

## Classificação OWASP

| Área | Avaliação |
|------|-----------|
| A01 Broken Access Control | Apenas utilizadores autenticados; Admin resolve email/username sem expor lista |
| A03 Injection | Email/username normalizados; username validado por regex |
| A07 Identification / Abuse | Enumeração de contas possível — mitigar com rate limit servidor |

**Fallback Auth:** quando a coleção `users` não tem correspondência, o servidor usa `getUserByEmail` com o mesmo endereço já enviado pelo cliente autenticado. Não amplia a superfície face ao lookup só por Firestore (o chamador já conhecia o e-mail); o impacto em enumeração permanece o descrito em A07.

## Logs

[`Docs/Firebase/DOC_route_friends_lookup.md`](../Firebase/DOC_route_friends_lookup.md)

## Data

2026-05-09 (revisão fallback Auth: 2026-05-10)
