# DOC_PermissoesIndex

## Camada aplicação

| Mecanismo | Escopo |
|-----------|--------|
| [`AuthGuard`](../../components/auth/auth-guard.tsx) | Rotas sob [`app/(authenticated)/`](../../app/(authenticated)/) — exige sessão Zustand (`user` + `accessToken`) |
| Firebase Auth | Operações Firestore permitidas por `request.auth` nas rules |
| API capture | Bearer Id Token obrigatório |

## Firestore

Autorização fina em [`firestore.rules`](../../firestore.rules) — ver [DOC_FirestoreRules.md](../Banco/DOC_FirestoreRules.md) e [SEC_FirestoreRules.md](../Seguranca/SEC_FirestoreRules.md).

## Geolocalização

Permissão browser (`navigator.permissions` / `getCurrentPosition`) — não há permissões Android/iOS nativas (é web).
