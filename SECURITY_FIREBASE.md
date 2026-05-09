# Postura de segurança Firebase (TerritoryRun Web)

## Princípios

- **Deny by default** nas Firestore Rules; explicit allow por coleção e operação.
- **Menor privilégio no cliente:** não gravar `territories`, `runs`, nem campos agregados (`xp`, áreas, contagens) a partir do browser — apenas rotas Next.js com **Firebase Admin SDK** + `FIREBASE_SERVICE_ACCOUNT_JSON` na Vercel.
- **Tokens:** validação server-side com `verifyIdToken(idToken, true)` (revogação).
- **PII:** documentos públicos (`usernames`) não contêm email; lookups sensíveis via API Admin.
- **Storage:** `storage.rules` em deny-all até existir produto com uploads.

## Superfícies

| Superfície | Controlo principal |
|------------|-------------------|
| Firestore cliente | Rules v2 (ver [`FIREBASE_RULES.md`](FIREBASE_RULES.md)) |
| APIs Next.js | Bearer Id Token + Zod + Admin SDK |
| Auth cliente | Firebase Auth (sessão); username→email só via `/api/auth/resolve-identifier` |
| Cloud Functions | Admin SDK (sem rules) |

## Residual / roadmap

- Rate limiting server-side nas APIs (hoje dependência parcial de rate limit no cliente).
- App Check para abuso de API key pública.
- Considerar cookies HttpOnly para sessão (fora do âmbito Firebase client SDK).

## Documentação detalhada

- [`FIREBASE_RULES.md`](FIREBASE_RULES.md)
- [`Docs/Seguranca/SEC_RulesV2_Auditoria.md`](Docs/Seguranca/SEC_RulesV2_Auditoria.md)
- [`DEPLOY_VERCEL_FIREBASE.md`](DEPLOY_VERCEL_FIREBASE.md)
