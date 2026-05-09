# Regras Firestore (mapa código ↔ segurança)

| Coleção | Leitura cliente | Escrita cliente | Escrita servidor (Admin) |
|---------|-----------------|-----------------|----------------------------|
| `users` | Dono | Perfil; stats bloqueados por regra | `/api/runs/complete`, `/api/territories/capture`, `expireStaleTerritories` |
| `publicProfiles` | Pública | Só nomes; stats bloqueados | Mesmas APIs / Functions |
| `usersPrivate` | Dono | Dono | — |
| `usernames` | Pública | Criar slug `{ uid, createdAt }` | Lookup login via `/api/auth/resolve-identifier` |
| `territories` | Pública | **Negada** | `/api/runs/complete`, `/api/territories/capture`, CF |
| `runs` | Dono | **Negada** | Mesmas APIs |
| `friendRequests` | Partes | Pedido/cancelar/aceitar conforme regra | — |

Referência completa: [`FIREBASE_RULES.md`](../../FIREBASE_RULES.md) e [`firestore.rules`](../../firestore.rules) na raiz do repositório.
