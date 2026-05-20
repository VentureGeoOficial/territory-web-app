# SEC — Loja / Patrocinadores (`sponsors`)

**Data:** 2026-05-20

## Modelo de ameaça

| Vetor | Mitigação |
|-------|-----------|
| XSS via `description` | React escapa texto; sem `dangerouslySetInnerHTML` |
| XSS via `ctaUrl` | `isSafeExternalUrl()` — só `http:` / `https:` |
| Open redirect | Links são `<a href>` externos; sem redirect server-side |
| Escrita não autorizada | Rules: `create, update, delete: if false` |
| Enumeração de PII | Coleção sem dados pessoais; leitura pública intencional |

## Rules

```javascript
match /sponsors/{sponsorId} {
  allow read: if true;
  allow create, update, delete: if false;
}
```

Escrita apenas via Admin SDK (Console Firebase ou scripts com service account).

## Severidade histórica

N/A — funcionalidade nova.

## Runbook

1. Deploy código + `firestore.rules` + `firestore.indexes.json`
2. Opcional: `pnpm seed:sponsors`
3. Smoke: `/loja`, CTA abre nova aba com `rel="noopener noreferrer"`

## Rollback

Reverter rules para remover bloco `sponsors` (app mostra empty state).
