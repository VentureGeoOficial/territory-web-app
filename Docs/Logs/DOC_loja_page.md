# DOC_loja_page

**Arquivos:** [`app/(authenticated)/loja/page.tsx`](../../app/(authenticated)/loja/page.tsx), [`components/loja/track-loja-cta.ts`](../../components/loja/track-loja-cta.ts)

## Logs estruturados (`lib/logging/logger.ts`)

| Evento | Nível | Scope | Objetivo |
|--------|-------|-------|----------|
| `page_view` | INFO | `LojaPage` | Rastrear entrada na área Loja (uid mascarado) |

**Contexto:** `uid` (opcional, mascarado pelo logger).

**Local de gravação:** stdout do servidor/cliente (JSON via `console.info`).

## Vercel Analytics

| Evento | Nível equivalente | Objetivo |
|--------|-------------------|----------|
| `loja_cta_click` | INFO | Medir cliques em CTAs da Loja |

**Campos:**

- `action`: ex. `anunciar`, `em_breve`, `visitar_parceiro`, `banner_em_breve`
- `section`: ex. `highlight`, `card_slot-1`, `banner-suplementos`
- `feature`: `Loja` (fixo)

**Origem:** `trackLojaCta()` em [`components/loja/track-loja-cta.ts`](../../components/loja/track-loja-cta.ts).

## Segurança dos logs

Não registra senhas, tokens, JWT, email completo, dados bancários ou localização.
