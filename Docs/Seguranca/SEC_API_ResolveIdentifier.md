# SEC_API_ResolveIdentifier

**Rota:** [`POST /api/auth/resolve-identifier`](../../app/api/auth/resolve-identifier/route.ts)

## Classificação OWASP

| Área | Avaliação |
|------|-----------|
| A01 Broken Access Control | Endpoint público pré-login — necessário para login por username após remoção de email em `usernames/*` |
| A07 Identification / Abuse | Permite descobrir email se username conhecido — mesmo perfil de risco que doc público antigo com email |
| A09 Logging | Email **não** vai para logs |

## Mitigações recomendadas

- Rate limiting por IP / fingerprint (edge middleware ou Cloudflare).
- Monitorização de volume por IP nos logs Vercel.

## Logs

[`Docs/Firebase/DOC_route_resolve_identifier.md`](../Firebase/DOC_route_resolve_identifier.md)

## Data

2026-05-09
