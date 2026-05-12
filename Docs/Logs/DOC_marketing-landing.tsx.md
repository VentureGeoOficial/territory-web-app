# DOC_marketing-landing.tsx

**Arquivo:** [`components/home/marketing-landing.tsx`](../../components/home/marketing-landing.tsx)

## Logs e Observabilidade

A landing page não utiliza `console.log`, `console.warn` ou `console.error`, pois não executa fluxo crítico de negócio, chamada a banco, autenticação, upload, cron/job ou processamento assíncrono próprio.

Para rastrear conversão sem gerar ruído operacional, foram adicionados eventos estruturados por meio do `@vercel/analytics`.

## Evento Adicionado

- **Nome:** `landing_cta_click`
- **Nível equivalente:** `INFO`
- **Objetivo:** medir interação com CTAs de cadastro, login, instalação PWA, saiba mais, patrocínio e seção do Speed.
- **Origem:** `MarketingLanding`
- **Local de gravação:** Vercel Analytics em ambiente de produção, conforme integração global em [`app/layout.tsx`](../../app/layout.tsx).

## Campos Registrados

- `action`: ação do CTA, como `criar_conta`, `comecar_agora`, `ja_tenho_conta`, `saiba_mais`, `instalar_app`, `anunciar`.
- `section`: local de origem do clique, como `nav`, `hero`, `cta_final`, `patrocinios`, `mascote_speed`.
- `feature`: valor fixo `MarketingLanding`.

## Segurança dos Logs

Os eventos não registram:

- Senhas
- Tokens
- JWT
- Cookies
- Email do usuário
- Dados bancários
- Localização GPS
- Identificador de usuário
- Dados pessoais sensíveis

## Justificativa

O objetivo é obter rastreabilidade de conversão e comportamento de navegação da landing sem adicionar spam de logs no console e sem expor dados sensíveis.
