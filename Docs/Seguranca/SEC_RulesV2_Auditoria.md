# Auditoria Firebase Security Rules v2

**Data:** 2026-05-09  
**Funcionalidade:** Migração para regras deny-by-default, writes sensíveis apenas via Admin SDK e APIs Next.js.

## Resumo executivo

| ID | Problema (antes) | Severidade OWASP | Estado (depois) |
|----|------------------|------------------|-----------------|
| R1 | `friendRequests`: remetente podia aceitar o próprio pedido (`status` → `accepted`) | **Crítico** (A01 Broken Access Control) | Transições explícitas: apenas destinatário aceita/recusa; remetente cancela |
| R2 | Dono podia forjar `xp`, `totalAreaM2`, `territoriesCount` em `users` / `publicProfiles` | **Crítico** (A04 Insecure Design / A08 Integrity) | Escritas de stats e docs `runs`/`territories` apenas servidor (Admin SDK) |
| R3 | `usernames/{slug}` legível por todos com campo `email` | **Crítico** (A01 / privacidade) | Doc público só `{ uid, createdAt }`; email só via Admin |
| R4 | Lookup de amigo por email (`users` query) incompatível com rules de leitura | **Alto** (funcional + A01) | `POST /api/friends/lookup` com token + Admin |
| R5 | Login por username (`getEmailByUsername` no cliente) após remoção de email em `usernames` | **Alto** | `POST /api/auth/resolve-identifier` (Admin, pré-login) |
| R6 | `verifyIdToken` sem `checkRevoked` nas APIs | **Alto** (A07) | `verifyIdToken(idToken, true)` centralizado |
| R7 | API capture carregava toda a coleção `territories` | **Alto** (DoS económico) | Query por `status` + faixa `centerLng` + filtro `centerLat` em memória |
| R8 | Sem `storage.rules` versionado | **Médio** (má configuração) | `storage.rules` deny-all + deploy |
| R9 | Superfície de enumeração em APIs públicas | **Médio** | Documentado; rate-limit servidor recomendado (roadmap) |

## Objetivo dos controlos

- **Menor privilégio:** cliente só altera perfil não sensível; agregados e jogo só no servidor.
- **Integridade:** stats derivadas de transações Admin, não de confiança no cliente.
- **Confidencialidade:** emails não em documentos públicos.

## Referências

- Regras: [`firestore.rules`](../../../firestore.rules)
- APIs: `app/api/runs/complete`, `app/api/territories/capture`, `app/api/friends/lookup`, `app/api/auth/resolve-identifier`
