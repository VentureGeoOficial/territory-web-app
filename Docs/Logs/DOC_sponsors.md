# Logs — Loja / Patrocinadores

## Objetivo

Rastrear subscrição Firestore da coleção `sponsors` e cliques em CTAs de parceiros.

## Eventos

| Evento | Nível | Origem | Descrição |
|--------|-------|--------|-----------|
| `sponsors_subscribed` | INFO | `lib/firebase/sponsors.ts` | Início do listener |
| `sponsors_received` | INFO | `lib/firebase/sponsors.ts` | Snapshot recebido (`count`) |
| `sponsors_error` | INFO | `lib/firebase/sponsors.ts` | Falha no listener (`code`, `message`) |
| `sponsors_cta_clicked` | INFO | `components/loja/sponsor-card.tsx`, `store-hero-section.tsx` | CTA externo clicado (`sponsorId`) |
| `sponsors_seed_*` | INFO/CRITICAL | `scripts/seed-sponsors.ts` | Progresso do seed |

## Segurança dos logs

- Não registar URLs completas de parceiros com tokens.
- `sponsorId` é identificador público do documento.
