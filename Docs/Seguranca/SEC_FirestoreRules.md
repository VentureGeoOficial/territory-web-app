# SEC_FirestoreRules

**Ficheiro:** [`firestore.rules`](../../firestore.rules)

## Estado v2 (2026-05-09)

| Área | Severidade anterior | Mitigação aplicada |
|------|---------------------|---------------------|
| Auto-aceitação `friendRequests` | **CRÍTICO** | Transições explícitas (destinatário aceita/recusa; remetente cancela) |
| Forja de `xp` / stats em `users` | **CRÍTICO** | Stats imutáveis em update; escritas via Admin nas APIs |
| Email público em `usernames` | **CRÍTICO** | Doc público só `{ uid, createdAt }` |
| Escrita cliente em `territories` / `runs` | **CRÍTICO** | Negado — apenas Admin |
| Leitura pública `territories` | **MÉDIO** | Mantido por design de mapa global (scraping possível) |

## OWASP

| ID | Notas |
|----|-------|
| A01 | Ownership explícito por coleção; catch-all deny |
| A04 | Integridade de stats confiada ao servidor |
| A05 | `storage.rules` deny-all versionado |

## Referências

- [`FIREBASE_RULES.md`](../../FIREBASE_RULES.md)
- [`Docs/Seguranca/SEC_RulesV2_Auditoria.md`](SEC_RulesV2_Auditoria.md)
