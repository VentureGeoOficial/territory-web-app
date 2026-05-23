# DOC_app-rating

**Módulos:** [`app/api/feedback/rating/route.ts`](../../app/api/feedback/rating/route.ts), [`components/feedback/app-rating-host.tsx`](../../components/feedback/app-rating-host.tsx), [`components/feedback/app-rating-prompt.tsx`](../../components/feedback/app-rating-prompt.tsx)

## Objetivo

Coletar avaliação do app (1–5 estrelas + comentário opcional até 250 caracteres) de utilizadores autenticados, com prompt fixo que some durante scroll e reaparece após parar.

## Logs estruturados (`lib/logging/logger.ts`)

| Evento | Nível | Origem |
|--------|-------|--------|
| `request_start` / `rating_saved` | INFO | `AppRatingApi` POST |
| `duplicate_submit` | INFO | `AppRatingApi` POST 409 |
| `get_failed` / `post_failed` | ERROR | `AppRatingApi` |
| `status_fetch_failed` | WARNING | `AppRatingHost` (cliente) |

Contexto: `scope`, `event`, `uid` mascarado, `stars`, `hasComment` (sem texto do comentário).

## Analytics (Vercel)

Evento `app_rating_event` com `action` (`prompt_shown`, `dismissed`, `submitted`), `section`, `feature`, `stars` (apenas no submit). Sem email, token ou comentário.

## Armazenamento

Coleção Firestore `appRatings/{uid}` — escrita apenas via Admin SDK na API; leitura pelo dono nas rules.
