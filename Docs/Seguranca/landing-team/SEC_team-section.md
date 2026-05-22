# SEC_team-section

**Módulo:** Seção "Desenvolvido por" (`components/landing/team/`)

**Data da análise:** 2026-05-22

## Escopo

Componentes isolados da landing: `TeamSection`, `TeamMemberCard`, `SocialLinks`, `team-data.ts`.

## Vulnerabilidades analisadas

### 1. Links externos maliciosos (Open Redirect / javascript:)

- **Severidade:** MÉDIO (mitigado)
- **Trecho:** `components/landing/team/social-links.tsx`, `is-safe-external-url.ts`
- **Risco:** URL arbitrária em `team-data.ts` poderia apontar para `javascript:` ou protocolos inseguros.
- **Correção:** `isSafeExternalUrl()` aceita apenas `https:`. Entradas inválidas são omitidas da UI.

### 2. XSS via bio ou nome

- **Severidade:** BAIXO (mitigado pelo React)
- **Trecho:** `team-member-card.tsx` — renderização textual de `member.name`, `member.role`, `member.bio`
- **Risco:** Injeção de HTML se usasse `dangerouslySetInnerHTML`.
- **Correção:** Conteúdo renderizado como texto; sem HTML bruto.

### 3. Tabnabbing em links sociais

- **Severidade:** BAIXO (mitigado)
- **Trecho:** `social-links.tsx`
- **Risco:** `target="_blank"` sem `rel` adequado.
- **Correção:** `rel="noopener noreferrer"` em todos os links externos.

### 4. Performance — asset PNG de alto tamanho

- **Severidade:** MÉDIO (aceito pelo produto)
- **Trecho:** `IMG/IMG-DEVS/Henrique.png` (~6 MB)
- **Risco:** Maior consumo de banda na seção da equipe.
- **Correção aplicada:** Removido `Henrique.jpeg` (qualidade insatisfatória). `team-data.ts` importa apenas `Henrique.png`. Lazy load no avatar mitiga impacto inicial de LCP da seção (abaixo da dobra).

## Dados sensíveis em analytics

Evento `landing_team_social_click` registra apenas `platform`, `memberId` e `feature`. Não inclui URLs completas, email ou tokens.

## Recomendações futuras

- Revisar URLs em `team-data.ts` antes de publicar redes sociais reais.
- Manter fotos novas abaixo de ~300 KB antes do commit.
