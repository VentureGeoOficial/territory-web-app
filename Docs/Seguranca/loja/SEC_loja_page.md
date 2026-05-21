# SEC_loja_page

**Data da análise:** 2026-05-20  
**Arquivos:** `app/(authenticated)/loja/*`, `components/loja/*`, `lib/loja/*`

## Resumo

Página estática com dados mock. Sem input do usuário persistido. Risco geral: **BAIXO**.

## Verificações OWASP

| Vetor | Status | Detalhe |
|-------|--------|---------|
| XSS | Mitigado | Textos estáticos/mock; links externos validados |
| Open redirect | Mitigado | `isSafeExternalHref` — apenas `https://` |
| Exposição de dados | OK | Logs mascaram uid; analytics sem PII |
| Auth | OK | Rota em `(authenticated)` + `AuthGuard` |
| `mailto:` injection | OK | Email fixo em `SPONSOR_CONTACT_EMAIL` |

## Trecho relevante

```ts
// lib/loja/validate-cta.ts
export function isSafeExternalHref(href: string | undefined): href is string {
  const url = new URL(href)
  return url.protocol === 'https:'
}
```

## Riscos futuros (Firestore)

- **MÉDIO:** URLs de patrocinadores vindas do admin devem passar por `isSafeExternalHref` antes de renderizar `<Link>`.
- **MÉDIO:** Validar uploads de imagem (tipo, tamanho, domínio Storage).

## Correções aplicadas

- Validação `https` para CTAs externos ativos
- Email de patrocínio em constante, sem concatenação de input do usuário
