# SEC_TokensClienteSide

## Armazenamento

[`auth-store`](../../lib/store/auth-store.ts) persiste `accessToken` (Firebase Id Token) em **`localStorage`** (`territoryrun-auth`).

## Severidade

| Classificação | Justificação |
|---------------|--------------|
| **MÉDIO** | XSS pode ler `localStorage`; tokens têm TTL curto (~1h) mas janela existe |

## Mitigações existentes

- CSP / sanitização dependem do React default escaping — não há CSP headers no [`next.config.mjs`](../../next.config.mjs).

## Recomendação

Migrar para **session cookie HttpOnly** + verificação server-side (Firebase session cookies) — evolução arquitetural.
