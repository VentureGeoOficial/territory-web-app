# SEC_marketing-landing.tsx

**Arquivo analisado:** [`components/home/marketing-landing.tsx`](../../../components/home/marketing-landing.tsx)

**Data da análise:** 2026-05-12

## Descrição da Vulnerabilidade

A versão anterior da landing utilizava imagens do mascote Speed por meio de URL externa hardcoded em domínio de blob storage:

```tsx
src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20260505_194510_0000-1UrbyUSIJhvFSFFbJnwKiZjVPfU2M2.png"
```

## Severidade

**MÉDIO**

## Risco Associado

- Dependência operacional de um domínio externo para renderizar parte importante da marca.
- Possível quebra visual caso o asset remoto seja removido, expire ou fique indisponível.
- Maior superfície de configuração para políticas futuras de CSP e carregamento de imagens.
- Menor controle sobre versionamento e auditoria do asset exibido na homepage.

## Correção Aplicada

- A imagem fornecida do Speed foi copiada para [`IMG/speed-mascote.png`](../../../IMG/speed-mascote.png).
- As referências externas foram removidas da landing.
- A renderização do mascote passou a usar `next/image` com import local.
- Os CTAs com observabilidade registram apenas metadados não sensíveis.

## Revisão OWASP

- **Input validation:** não há entrada de usuário nesta página.
- **XSS:** não há renderização de HTML dinâmico ou conteúdo não confiável.
- **SQL Injection:** não há acesso a banco de dados.
- **Autenticação/autorização:** links de login/cadastro preservados; página pública sem área restrita.
- **Exposição de dados sensíveis:** eventos de analytics não enviam usuário, email, token, cookie ou localização.
- **APIs externas:** removida dependência de imagem remota para o mascote.
- **Hardcoded secrets:** nenhum segredo identificado.

## Trecho Afetado

O trecho afetado estava nas imagens `<img>` da seção `#mascote-speed` e do bloco de patrocínios. A correção substituiu o `src` remoto por asset local importado em `components/home/marketing-landing.tsx`.

## Atualização de Asset (2026-05-12)

- O arquivo [`IMG/speed-mascote.png`](../../../IMG/speed-mascote.png) foi sobrescrito pela versão sem fundo do mascote (transparente), mantendo o mesmo caminho e nome para não exigir alteração de imports.
- **Revisão OWASP da troca:**
  - PNG é asset estático servido via `next/image`, sem execução de código. Não introduz vetor de XSS, SQLi, RCE ou exposição de credenciais.
  - Arquivo foi fornecido pelo próprio responsável do produto e ingressou no repositório sem passar por upload de usuário final, eliminando o risco de payload malicioso de terceiros não confiáveis.
  - Sem novo endpoint, sem nova dependência externa, sem alteração de cabeçalhos/CSP.
- **Severidade da mudança:** N/A (mudança meramente visual de asset estático).
- **Observação operacional:** o novo arquivo tem ~476 KB (versus ~41 KB anterior). O `next/image` aplica compressão e responsividade automaticamente, mas recomenda-se rodar uma otimização lossless (ex.: `oxipng` ou `pngquant`) caso o tamanho do bundle de assets se torne relevante em auditorias futuras de performance.

## Inclusão de Vídeo de Saudação no Hero (2026-05-12)

- Asset adicionado: [`public/speed-mascote.mp4`](../../../public/speed-mascote.mp4) (~1.6 MB, MP4 H.264). Servido estaticamente pelo Next.js a partir de `public/`.
- Componente criado: `SpeedHeroMedia` em `components/home/marketing-landing.tsx`. Renderiza `<video>` no hero como saudação ao usuário, **tocando uma única vez** e transicionando para o PNG estático ao final (sem loop).
- **Severidade da mudança:** BAIXA.
- **Revisão OWASP da inclusão de vídeo:**
  - **Input validation:** o atributo `src` é uma constante interna (`HERO_VIDEO_SRC = '/speed-mascote.mp4'`). Não há concatenação com dados de usuário, query string ou conteúdo externo, eliminando risco de injeção.
  - **XSS:** o elemento `<video>` não executa scripts; o `<source>` aponta para asset estático interno. Não há interpolação de HTML/JS.
  - **Exposição de dados sensíveis:** o vídeo é decorativo, sem áudio embutido relevante e sem metadata pessoal. Eventos de analytics (`landing_video_loaded`, `landing_video_completed`, `landing_video_error`, `landing_video_autoplay_blocked`) carregam apenas `feature`, `section` e `asset`.
  - **CSRF/auth:** página pública, sem cookies de sessão envolvidos no request do MP4.
  - **CSP:** o vídeo é same-origin (`/speed-mascote.mp4`), compatível com diretivas restritivas de `media-src 'self'`.
  - **Privacidade do usuário:** `autoplay` requer `muted=true`, o que satisfaz políticas de browsers e elimina vazamento de áudio inesperado. Usuários com `prefers-reduced-motion: reduce` recebem fallback estático automático.
  - **Hardcoded secrets:** nenhum.
- **Resiliência:** três caminhos de fallback automático para a imagem estática (erro de carga, autoplay bloqueado e redução de movimento), evitando hero quebrado em qualquer cenário.
- **Risco operacional / performance:**
  - Vídeo de 1.6 MB no above-the-fold aumenta o "data cost" do hero. O atributo `preload="metadata"` mitiga, baixando apenas o cabeçalho até que a reprodução comece.
  - Recomenda-se monitorar `landing_video_autoplay_blocked` em produção: alta incidência indica que a maioria dos usuários nem chega a ver a animação, e o valor do asset deve ser reavaliado.
  - Recomenda-se gerar versões alternativas (WebM, fps reduzido, bitrate menor) caso o consumo se mostre relevante em mobile.
