# SEC_app-rating

**Data da análise:** 22/05/2026  
**Ficheiros:** `app/api/feedback/rating/route.ts`, `components/feedback/app-rating-prompt.tsx`, `firestore.rules`

## Resumo

| Área | Avaliação |
|------|-----------|
| Autenticação | OK — `verifyAuthOrFail` em GET/POST |
| Validação de entrada | OK — Zod `stars` 1–5, `comment` máx. 250 |
| XSS / injeção | OK — comentário trim + remoção `<>` antes de persistir |
| Rate limit | OK — `assertFeedbackRateLimit` (6 req/min por uid) |
| Dados sensíveis em logs | OK — comentário não é logado |
| Firestore | OK — `appRatings` sem write cliente; catch-all nega resto |

## Riscos tratados

- **ALTO (evitado):** write público em avaliações — mitigado com API + rules `create, update, delete: if false`.
- **MÉDIO:** spam de avaliações — uma avaliação por uid (409) + rate limit.
- **BAIXO:** comentário com HTML — sanitização básica; exibição futura deve usar escape/React text nodes.

## Correções aplicadas

- Persistência exclusiva via `POST /api/feedback/rating` com token Firebase.
- Rules dedicadas em `appRatings/{userId}`.
