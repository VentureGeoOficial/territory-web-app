# DOC_MarketingLanding

**Arquivo:** [`components/home/marketing-landing.tsx`](../../components/home/marketing-landing.tsx)

Landing institucional da VentureGeo e do TerritoryRun. A página foi organizada em três grandes blocos de conteúdo:

- **Sobre o aplicativo:** hero, CTAs de conversão, benefícios, funcionamento, recursos, tecnologia e patrocínios.
- **Sobre a VentureGeo:** empresa, significado do nome, posicionamento, missão, visão e valores.
- **Mascote Speed:** apresentação do mascote, representação de marca e relação com movimento, superação, conquista e competição.

## Principais Ações

- `/cadastro`: CTAs `Criar conta`, `Começar agora`, `Criar conta grátis` e `Começar com o Speed`.
- `/login`: CTAs `Entrar` e `Já tenho conta`.
- `#por-que-territoryrun`, `#como-funciona`, `#recursos`, `#quem-somos`, `#mascote-speed`, `#patrocinios`: navegação interna.
- `mailto:patrocinio@venturegeo.com.br`: contato comercial para patrocínios e anúncios.
- `promptInstall`: instalação PWA quando `useInstallPrompt` expõe `canInstall`.

## Imagens

- O mascote da homepage usa o asset local [`IMG/speed-mascote.png`](../../IMG/speed-mascote.png).
- Em 12/05/2026 esse asset foi atualizado para a versão sem fundo (transparente), substituindo a arte anterior com fundo preto. A troca foi feita preservando o mesmo nome de arquivo, sem alteração de imports.
- O mascote aparece em três pontos da página: hero, seção `#mascote-speed` e CTA final. Todos consomem o asset através do componente interno `SpeedImage`.
- As URLs externas antigas do Vercel Blob foram removidas para reduzir fragilidade operacional e dependência de domínio terceiro.
- Imagens informativas do Speed usam `alt` descritivo; imagens meramente decorativas usam `aria-hidden`.
- Otimização de delivery: o asset é importado estaticamente e servido via `next/image`, que aplica compressão, redimensionamento responsivo e cache. Não há serving direto do PNG bruto para o cliente.

## Observabilidade

- CTAs principais enviam eventos `landing_cta_click` via `@vercel/analytics`.
- Os eventos registram apenas `action`, `section` e `feature`.
- Não há registro de usuário, email, token, cookie, localização ou qualquer dado sensível.

## Segurança

- Não há entrada de usuário, chamada direta a API, autenticação ou persistência de dados nesta página.
- Links externos de redes sociais preservam `target="_blank"` com `rel="noopener noreferrer"`.
- O contato por email usa `mailto:` sem coletar dados no front-end.
