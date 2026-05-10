# SEC_API_FriendsLookup

**Rota:** [`POST /api/friends/lookup`](../../app/api/friends/lookup/route.ts)

## Classificação OWASP

| Área | Avaliação |
|------|-----------|
| A01 Broken Access Control | Apenas utilizadores autenticados; Admin resolve email/username sem expor lista |
| A03 Injection | Email/username normalizados; username validado por regex |
| A07 Identification / Abuse | Enumeração de contas possível — mitigar com rate limit servidor |

**UI `/amigos`:** o utilizador introduz apenas **@username** (slug público). Não é obrigatório digitar e-mail de terceiros no cliente — reduz superfície de enumeração por e-mail comparando com fluxos que pedem e-mail em claro.

**Fallback Auth (e-mail):** quando `users` não tem correspondência por e-mail, o servidor usa `getUserByEmail` com o mesmo endereço já enviado pelo cliente autenticado.

**Fallback `users.username` (slug):** se `usernames/{slug}` não existir (dados legados), o Admin consulta `users` com `username == slug` e usa o **ID do documento** como UID alvo. O cliente já indicou o slug pretendido; impacto em enumeração equivalente ao lookup por `usernames`.

## Logs

[`Docs/Firebase/DOC_route_friends_lookup.md`](../Firebase/DOC_route_friends_lookup.md)

## Data

2026-05-09 (revisões: fallback Auth 2026-05-10; fallback `users.username` 2026-05-10)
