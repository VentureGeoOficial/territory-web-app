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

## Imagens e Mídia

- O mascote da homepage usa o asset local [`IMG/speed-mascote.png`](../../IMG/speed-mascote.png).
- Em 12/05/2026 esse asset foi atualizado para a versão sem fundo (transparente), substituindo a arte anterior com fundo preto. A troca foi feita preservando o mesmo nome de arquivo, sem alteração de imports.
- O mascote aparece em três pontos da página: hero, seção `#mascote-speed` e CTA final.
  - **Hero (saudação animada)**: usa o componente interno `SpeedHeroMedia`, que renderiza o vídeo [`public/speed-mascote.mp4`](../../public/speed-mascote.mp4) **uma única vez como saudação inicial** e, ao final, transiciona automaticamente para a imagem estática `SpeedImage`. Isso evita que o loop infinito distraia a leitura do `<h1>` e dos CTAs ao lado.
  - **Seção `#mascote-speed` e CTA final**: continuam com a imagem estática via `SpeedImage`.
- As URLs externas antigas do Vercel Blob foram removidas para reduzir fragilidade operacional e dependência de domínio terceiro.
- Imagens informativas do Speed usam `alt` descritivo; imagens meramente decorativas usam `aria-hidden`.
- Otimização de delivery: o PNG é importado estaticamente e servido via `next/image`, que aplica compressão, redimensionamento responsivo e cache. Não há serving direto do PNG bruto para o cliente.

## Vídeo de Saudação (hero)

- Asset servido estaticamente em `public/speed-mascote.mp4` (~1.6 MB, formato MP4).
- Componente: `SpeedHeroMedia`, definido em `components/home/marketing-landing.tsx`.
- Atributos aplicados ao elemento `<video>`:
  - `autoPlay`, `muted`, `playsInline`: garantem reprodução automática silenciosa em todos os browsers, inclusive iOS Safari (sem abrir tela cheia).
  - **Sem `loop`**: o vídeo toca exatamente uma vez. Após o término, o componente substitui o `<video>` pelo `SpeedImage` (PNG sem fundo), garantindo um estado final visualmente consistente com o restante da página e evitando que a animação compita por atenção com o `<h1>` e CTAs do hero.
  - `preload="metadata"`: evita baixar o vídeo inteiro antes do necessário, reduzindo custo de banda para usuários que rolam rapidamente para fora do hero.
  - `poster={speedMascot.src}`: usa o PNG do mascote como frame inicial, eliminando o "flash" preto enquanto o vídeo é carregado.
  - `disablePictureInPicture` e `controls={false}`: o vídeo é decorativo, sem UI de player.
  - `aria-label`: descreve a saudação para tecnologias assistivas.
- Transição para imagem estática (`SpeedImage`) em quatro situações:
  - Conclusão natural do vídeo (evento `onEnded`) — fluxo padrão da saudação.
  - Usuário com `prefers-reduced-motion: reduce` configurado no sistema operacional/navegador (já entra como imagem desde o primeiro render).
  - Erro de carregamento do vídeo (evento `onError`).
  - Bloqueio de autoplay (evento `play()` rejeitado) — neste caso o evento `landing_video_autoplay_blocked` é registrado e a UI continua exibindo o vídeo com poster até a próxima interação.
- Limitação conhecida: MP4 padrão não suporta canal alpha. O vídeo carrega o fundo embutido pela arte. Caso seja necessário o mesmo efeito "flutuante" da imagem PNG sem fundo, será preciso fornecer versões em WebM (VP9 alpha) e HEVC alpha, e o componente deverá ser estendido para incluir múltiplos `<source>`.

## Observabilidade

- CTAs principais enviam eventos `landing_cta_click` via `@vercel/analytics`.
- Eventos do vídeo de saudação do hero (componente `SpeedHeroMedia`):
  - `landing_video_loaded`: emitido em `onLoadedData`. Confirma que o vídeo carregou e está pronto para reprodução.
  - `landing_video_completed`: emitido em `onEnded`. Indica que o usuário assistiu à saudação inteira; útil para medir engajamento real com o hero.
  - `landing_video_error`: emitido em `onError`. Falha de download/decodificação; o componente cai automaticamente em fallback para a imagem estática.
  - `landing_video_autoplay_blocked`: emitido quando o `play()` programático é rejeitado pelo browser (políticas de autoplay). Indica usuário com som forçado, modo economia de energia ou navegadores restritos.
- Todos os eventos carregam apenas metadados não sensíveis: `feature`, `section`, `action` ou `asset`.
- Não há registro de usuário, email, token, cookie, localização ou qualquer dado sensível.

## Segurança

- Não há entrada de usuário, chamada direta a API, autenticação ou persistência de dados nesta página.
- Links externos de redes sociais preservam `target="_blank"` com `rel="noopener noreferrer"`.
- O contato por email usa `mailto:` sem coletar dados no front-end.
