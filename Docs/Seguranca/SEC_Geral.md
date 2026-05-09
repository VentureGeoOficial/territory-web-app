# SEC_Geral

**Data:** 2026-05-09  
**Âmbito:** TerritoryRun Web — OWASP-inspired review consolidada.

## Superfícies de ataque principais

1. **Cliente:** XSS → roubo de Id Token em `localStorage`; bundle expõe `NEXT_PUBLIC_*`.
2. **Firestore:** rules são a linha de defesa principal para dados utilizador.
3. **APIs servidor:** Bearer token + `verifyIdToken(..., true)` + Zod — [`/api/runs/complete`](../../app/api/runs/complete/route.ts), [`/api/territories/capture`](../../app/api/territories/capture/route.ts), [`/api/friends/lookup`](../../app/api/friends/lookup/route.ts); pré-login [`/api/auth/resolve-identifier`](../../app/api/auth/resolve-identifier/route.ts) (enumeração — precisa rate limit edge).
4. **Infra:** `FIREBASE_SERVICE_ACCOUNT_JSON` na Vercel — vazamento = compromisso total do projeto Firebase.

## Documentos filhos

| Documento | Tema |
|-----------|------|
| [SEC_AuthFlows.md](SEC_AuthFlows.md) | Login, sessão, logout |
| [SEC_TokensClienteSide.md](SEC_TokensClienteSide.md) | Armazenamento token |
| [SEC_FirestoreRules.md](SEC_FirestoreRules.md) | Regras Firestore |
| [SEC_API_Capture.md](SEC_API_Capture.md) | Rota capture |
| [SEC_API_RunsComplete.md](SEC_API_RunsComplete.md) | Rota corrida normal |
| [SEC_API_FriendsLookup.md](SEC_API_FriendsLookup.md) | Lookup amigos |
| [SEC_API_ResolveIdentifier.md](SEC_API_ResolveIdentifier.md) | Login username |
| [SEC_RulesV2_Auditoria.md](SEC_RulesV2_Auditoria.md) | Auditoria rules v2 |
| [SEC_RateLimiting.md](SEC_RateLimiting.md) | Rate limit apenas cliente |
| [firebase-config/SEC_firebase-env.md](firebase-config/SEC_firebase-env.md) | Variáveis ambiente |
