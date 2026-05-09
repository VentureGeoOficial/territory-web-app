# DOC_RelatorioSegurancaV2 — endurecimento Firebase (2026-05-09)

## Sumário executivo

Refatoração das **Firestore Security Rules**, rotas **Next.js + Admin SDK**, **Storage rules** deny-all e documentação OWASP/observabilidade. Objetivo: eliminar privilégio excessivo no cliente, auto-aceitação de amizades, forja de stats e PII em documentos públicos.

## Vulnerabilidades tratadas

| ID | Descrição | Severidade |
|----|-----------|------------|
| V1 | Auto-aceitação de pedidos de amizade | CRÍTICO |
| V2 | Forja de `xp` / áreas em `users` / `publicProfiles` | CRÍTICO |
| V3 | Email em `usernames/*` legível publicamente | CRÍTICO |
| V4 | `verifyIdToken` sem revogação nas APIs | ALTO |
| V5 | Leitura massiva de territórios na captura | ALTO → **parcialmente mitigado** (filtro `status`) |

## Artefactos entregues

| Artefacto | Caminho |
|-----------|---------|
| Rules Firestore | [`firestore.rules`](../../firestore.rules) |
| Rules Storage | [`storage.rules`](../../storage.rules) |
| Postura | [`SECURITY_FIREBASE.md`](../../SECURITY_FIREBASE.md) |
| Matriz rules | [`FIREBASE_RULES.md`](../../FIREBASE_RULES.md) |
| Auditoria | [`Docs/Seguranca/SEC_RulesV2_Auditoria.md`](../Seguranca/SEC_RulesV2_Auditoria.md) |
| APIs novas | `/api/runs/complete`, `/api/friends/lookup`, `/api/auth/resolve-identifier` |
| Testes rules | `npm run test:rules` → [`__tests__/firestore-rules/firestore-rules.test.ts`](../../__tests__/firestore-rules/firestore-rules.test.ts) |

## Testes executados

- `npm run build` — OK (Next.js).
- `npm run test:rules` — requer `vitest` + `@firebase/rules-unit-testing` instalados (`package.json`); em ambientes com falha TLS na registry npm, executar `npm install` localmente e voltar a correr.

## Residual / roadmap

| Item | Severidade |
|------|------------|
| Rate limit servidor nas APIs | MÉDIO |
| App Check | MÉDIO |
| Escalabilidade query territórios `status in` | MÉDIO (monitorização) |

## Deploy coordenado

Ver secção **Ordem de rollout coordenado** em [`DEPLOY_VERCEL_FIREBASE.md`](../../DEPLOY_VERCEL_FIREBASE.md).
