# DOC_team-section

**Módulo:** [`components/landing/team/`](../../components/landing/team/)

## Logs e Observabilidade

A seção de equipe não utiliza `lib/logging/logger` nem `console.*`, alinhada à política da landing (`DOC_marketing-landing.tsx.md`).

## Evento (Vercel Analytics)

| Campo | Valor |
|-------|--------|
| **Nome** | `landing_team_social_click` |
| **Nível equivalente** | INFO |
| **Objetivo** | Medir cliques em redes sociais dos cards da equipe |
| **Origem** | `SocialLinks` / `track-team-social.ts` |
| **Local** | Vercel Analytics (produção) |

### Payload

- `platform`: `github` \| `linkedin` \| `instagram`
- `memberId`: id do membro em `team-data.ts`
- `feature`: `TeamSection`

## Segurança dos logs

Não registra URLs completas, email, tokens ou dados pessoais sensíveis.

## Imagens

- Fotos servidas via import estático em `team-data.ts`
- Henrique: `IMG/IMG-DEVS/Henrique.png` (qualidade original preservada)
- Avatares com `loading="lazy"` e fallback de iniciais
