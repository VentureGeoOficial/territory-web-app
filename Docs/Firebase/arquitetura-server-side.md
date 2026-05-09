# Arquitetura server-side (Next.js + Admin SDK)

## Rotas API

| Rota | Auth | Função |
|------|------|--------|
| `POST /api/runs/complete` | Bearer Id Token (`verifyIdToken(..., true)`) | Valida corrida, gera território, transação `territories` + `runs` + stats |
| `POST /api/territories/capture` | Id Token | Conquista hostil (transação Admin existente) |
| `POST /api/friends/lookup` | Id Token | Resolve email/username → `uid` alvo |
| `POST /api/auth/resolve-identifier` | Nenhuma (pré-login) | Resolve username → email via Admin (login por username) |

## Módulos partilhados

- [`lib/firebase/admin-auth.ts`](../../lib/firebase/admin-auth.ts) — `verifyAuthOrFail`
- [`lib/firebase/admin-user-map.ts`](../../lib/firebase/admin-user-map.ts) — doc Firestore → tipo domínio `User`
- [`lib/firebase/admin-territories-query.ts`](../../lib/firebase/admin-territories-query.ts) — lista territórios `active|disputed|protected`
- [`lib/firebase/admin-normal-run.ts`](../../lib/firebase/admin-normal-run.ts) — transação corrida normal

## Variáveis Vercel

- `FIREBASE_SERVICE_ACCOUNT_JSON` — obrigatória para todas as rotas Admin acima.
