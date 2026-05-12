# DOC_BMC_ModeloNegocios

**Produto / startup:** Venture Geo — **Territory Run** (PWA web)  
**Ferramenta:** Business Model Canvas (Osterwalder & Pigneur, 2010)  
**Data:** 2026-05-11  
**Método:** conteúdo alinhado ao **código e documentação técnica** do repositório (sem proposições genéricas desconectadas do sistema implementado).

**Artefatos visuais (Etapa 5):**

| Artefato | Caminho |
|----------|---------|
| Canvas SVG (A3 paisagem, vetorial) | [`BMC_TerritoryRun.svg`](BMC_TerritoryRun.svg) |
| Canvas HTML (imprimir → PDF) | [`BMC_TerritoryRun.html`](BMC_TerritoryRun.html) |
| **Relatório PDF (canvas + texto)** | [`BMC_TerritoryRun_Completo.html`](BMC_TerritoryRun_Completo.html) — abrir no navegador → **Ctrl+P** → **Salvar como PDF** (recomenda-se **A4** ou **A3** na horizontal na primeira página) |

> **Nota (SVG):** o arquivo `BMC_TerritoryRun.svg` está em **UTF-8**, com **acentuação em português**. Se algum visualizador antigo exibir caracteres incorretos, abra o arquivo no **Chrome**, no **Edge** ou no **Inkscape**.

**Baixar arquivos (local):**

- **SVG:** clique com o botão direito em [`BMC_TerritoryRun.svg`](BMC_TerritoryRun.svg) → “Salvar como…” **ou** use o botão “Descarregar SVG” em [`BMC_TerritoryRun.html`](BMC_TerritoryRun.html).
- **PDF único (imagem + texto):** abra [`BMC_TerritoryRun_Completo.html`](BMC_TerritoryRun_Completo.html) e use **Imprimir → Salvar como PDF**.

**Identificação institucional (uso acadêmico):** Centro Universitário Piaget — UniPiaget Brasil. Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (CST em ADS), **2026.1**. Disciplina: **Projeto de Startups**. Etapa 5 — Modelo de Negócios (*Business Model Canvas*).

---

## 1. Canvas — os nove blocos (síntese)

### 1.1 Segmentos de Clientes

**B2C (usuário final — gratuito)**

- **Corredores amadores e profissionais** que buscam **motivação extra** — treino com meta territorial e feedback no mapa.
- **Entusiastas de tecnologia e de esporte (“Geogamers”)** — interseção entre *fitness*, mapa e competição leve.
- **Usuários** interessados em **ferramentas de performance com foco em dados e estratégia** (área conquistada, ranking, evolução).
- **Contexto geográfico do MVP:** Suzano-SP e Grande SP, alinhado à geofence `SUZANO_BOUNDING_BOX` no código — ver [`lib/territory/regions.ts`](../../lib/territory/regions.ts) e [`Docs/Funcoes/DOC_Regions.md`](../Funcoes/DOC_Regions.md).

**B2B (pagante — receita)**

- Lojas esportivas, academias e marcas de nutrição/vestuário que buscam **público ativo e geolocalizado**.
- Comércio de bairro com interesse em **exposição contextual** junto ao mapa e às rotas.
- (Médio prazo) prefeituras / turismo para **eventos e ativações** em espaço público.

**Justificativa:** os segmentos acima descrevem a **ambição de mercado** e o posicionamento Venture Geo na landing; a **restrição técnica atual** (Suzano) mantém-se como âncora de MVP comprovável no repositório — ver [`components/home/marketing-landing.tsx`](../../components/home/marketing-landing.tsx).

---

### 1.2 Proposta de Valor

**Para o corredor (B2C)**

- **Transformação da corrida individual** em **uma batalha tática de conquista territorial** — o loop de corrida fecha polígonos no mapa e materializa domínio de área (ver [`Docs/Fluxos/DOC_FluxoCorridaECaptura.md`](../Fluxos/DOC_FluxoCorridaECaptura.md)).
- **Gamificação urbana com feedback visual em tempo real** — *grid* de fundo no mapa e **HUDs/overlays** de sessão (ritmo, estado da corrida, território) como camada de imersão; parte é **visão de produto** a aprofundar no front (`components/map`, overlays), parte já existe na experiência de mapa em tempo real.
- **Ranking global e entre amigos**, troféus e progressão — [`Docs/Telas/DOC_TelaCompeticao.md`](../Telas/DOC_TelaCompeticao.md), [`Docs/Funcoes/DOC_Trophies.md`](../Funcoes/DOC_Trophies.md), [`Docs/Funcoes/DOC_Scoring.md`](../Funcoes/DOC_Scoring.md).
- **PWA** sem dependência obrigatória de loja — instalação pelo browser — [`lib/pwa/use-install-prompt.ts`](../../lib/pwa/use-install-prompt.ts).
- **100% gratuito** para **usuários**; **sustentação** declarada via **anúncios de parceiros** na landing.

**Para a marca (B2B)**

- Acesso a **audiência engajada** e **geolocalizada** (sessão de treino + mapa).
- **Patrocínios e anúncios de parceiros** integrados à experiência — preço de entrada **R$ 49,99/mês** e **contato** comercial `patrocinio@venturegeo.com.br` em [`components/home/marketing-landing.tsx`](../../components/home/marketing-landing.tsx).

**Justificativa:** a narrativa de *batalha territorial* e *HUD* alinha-se ao posicionamento Venture Geo; a prova técnica no código permanece mapa + Firestore + rotas documentadas em [`Docs/Telas/DOC_TelasIndex.md`](../Telas/DOC_TelasIndex.md).

---

### 1.3 Canais

**Texto sintético para o quadro do canvas (lista acordada com a equipe)**

1. **Landing page oficial** hospedada na **Vercel**.
2. **Aplicativo mobile TerritoryRun** (marca também grafada **Territory Run**; no repositório, entregue como **PWA** — *Progressive Web App* — instalável pelo navegador; **versões nativas** para lojas podem integrar o roadmap — ver § 1.8).
3. **Redes sociais** focadas em **conteúdo dinâmico** (**Instagram** / **Facebook**).

**Detalhamento técnico-documental (complemento ao canvas)**

- A **landing page** corresponde à aplicação **Next.js** em produção na **Vercel**, com entrada na raiz `/` — [`Docs/Telas/DOC_TelaHome.md`](../Telas/DOC_TelaHome.md), [`app/page.tsx`](../../app/page.tsx).
- O **aplicativo móvel** corresponde, no **MVP**, à experiência **web responsiva** e **PWA** — [`lib/pwa/use-install-prompt.ts`](../../lib/pwa/use-install-prompt.ts), [`README.md`](../../README.md).
- As **redes sociais** constam na landing com ícones e *links* — [`components/home/marketing-landing.tsx`](../../components/home/marketing-landing.tsx); a **produção de conteúdo dinâmico** é atividade operacional de marketing.

**Canais complementares**

- **Marketing de proximidade** em Suzano / Grande SP (eventos, clubes, parques), coerente com a geofence do MVP.
- **B2B:** **contato** por e-mail (`patrocinio@venturegeo.com.br`) e **relacionamento consultivo** (proposta comercial, formatos de mídia no mapa).

**Entrega do produto (uso)**

- Rotas autenticadas sob `(authenticated)` — mapa, competição, amigos, troféus, conta, ajuda — ver [`README.md`](../../README.md) e [`Docs/Telas/DOC_TelasIndex.md`](../Telas/DOC_TelasIndex.md).

**Justificativa:** a lista em três itens atende ao enunciado acadêmico e à comunicação institucional; o detalhamento mantém **fidelidade ao código** (Vercel + PWA), explicitando que “aplicativo mobile”, neste estágio, materializa-se como **PWA**, sem binário publicado nas lojas no repositório atual.

---

### 1.4 Relacionamento com Clientes

**B2C**

- **Experiência gamificada** com foco em **retenção e competitividade** — ranking, territórios, amigos e troféus (ver [`Docs/Telas/DOC_TelaCompeticao.md`](../Telas/DOC_TelaCompeticao.md), [`lib/services/friends-service.ts`](../../lib/services/friends-service.ts)).
- **Interação humanizada** através do mascote **Speed** — narrativa e presença visual na landing [`components/home/marketing-landing.tsx`](../../components/home/marketing-landing.tsx).
- **Notificações inteligentes** e **suporte técnico via plataforma** — baseado em notificações na app onde implementadas, FAQ e rotas de ajuda (`/ajuda` — [`Docs/Telas/DOC_TelaAjuda.md`](../Telas/DOC_TelaAjuda.md)); *push* Web/PWA conforme evolução do produto.
- **Self-service**: cadastro, login (e-mail/senha + Google), recuperação de senha — [`Docs/Integracoes/DOC_FirebaseAuth.md`](../Integracoes/DOC_FirebaseAuth.md), fluxos em [`Docs/Fluxos/`](../Fluxos/).
- **Transparência / confiança**: `/termos`, `/privacidade`, [`Docs/lgpd.md`](../lgpd.md) (legado).

**B2B**

- Relacionamento **consultivo e direto** (e-mail + reunião comercial), com pacotes mensais anunciados na landing.

**Justificativa:** o modelo combina **comunidade digital** já suportada pelo código com a **persona Speed** da marca; canais de suporte pesados (call center 24/7) não estão no repositório — manter expectativa alinhada a FAQ e **contato** assíncrono (e-mail / plataforma).

---

### 1.5 Fontes de Receita

**Receita operacional atual (comunicada na landing)**

- **Patrocínios e anúncios de parceiros (B2B)** — pacotes a partir de **R$ 49,99/mês**; **contato** `patrocinio@venturegeo.com.br` — [`components/home/marketing-landing.tsx`](../../components/home/marketing-landing.tsx).

**Modelo de receita planejado (roadmap — sem cobrança implementada no código)**

- **Assinatura mensal** para acesso a **funcionalidades premium** (camada paga sobre o uso gratuito).
- **Modelo *freemium***: aquisição de novos corredores com **uso gratuito** e **conquista de territórios na modalidade básica**; monetização em funcionalidades ou camadas superiores.
- **Taxas por serviços no aplicativo** (*in-app*) e **itens de personalização** (aparência, *skins*, cosméticos) — fase futura.

**Outras hipóteses (fora do escopo imediato de billing)**

- **Eventos patrocinados**; **licenciamento / white-label** para prefeitura ou clube.

**Justificativa:** não há *Stripe*, IAP (*In-App Purchase*) ou módulo de faturação no [`package.json`](../../package.json) — ver [`Docs/Dependencias/DOC_DependenciasNPM.md`](../Dependencias/DOC_DependenciasNPM.md). O quadro distingue **receita já anunciada** (B2B) de **proposições de monetização B2C** típicas de um BMC acadêmico, ainda **sem implementação técnica** no repositório.

---

### 1.6 Recursos-Chave

- **Algoritmos e lógica proprietários** de **domínio territorial** e **geolocalização** — regras de território, captura e geometria em `lib/territory/*`, transações em [`lib/firebase/transactions.ts`](../../lib/firebase/transactions.ts), integração com GPS do dispositivo e stack de mapas (Leaflet, Turf, OSM) — ver [`Docs/Funcoes/DOC_FuncoesIndex.md`](../Funcoes/DOC_FuncoesIndex.md), [`Docs/Integracoes/DOC_Leaflet.md`](../Integracoes/DOC_Leaflet.md).
- **Marca Venture Geo** e mascote **Speed** integrados à interface — identidade visual e narrativa na landing e nos componentes de marca — [`components/home/marketing-landing.tsx`](../../components/home/marketing-landing.tsx), [`components/brand/`](../../components/brand/).
- **Equipe interna de desenvolvimento** — **startup composta por três pessoas** (papéis descritos na seção “Nossa Squad” da landing: Leonardo Souza Bastos, Henrique Casagrande, Marcelo Candido).

**Infraestrutura e stack de suporte (sem os quais o produto não escala)**

- **Next.js**, **React**, **Firebase** (Auth, Firestore), **Cloud Function** `expireStaleTerritories` — [`Docs/Geral/DOC_RelatorioFinal.md`](../Geral/DOC_RelatorioFinal.md), [`Docs/APIs/DOC_CloudFunctions.md`](../APIs/DOC_CloudFunctions.md), [`Docs/Banco/DOC_FirestoreSchema.md`](../Banco/DOC_FirestoreSchema.md), [`Docs/Dependencias/DOC_DependenciasNPM.md`](../Dependencias/DOC_DependenciasNPM.md).

**Justificativa:** os três primeiros itens respondem ao núcleo **diferenciador** (domínio + marca + equipe); o bloco seguinte documenta a **plataforma técnica** já versionada.

---

### 1.7 Atividades-Chave

- **Engenharia de produto:** evolução do mapa, captura, ranking, amigos, PWA — código em `app/`, `components/`, `lib/`.
- **Operação geoespacial / integridade do jogo:** expiração de territórios stale, transações de captura — [`Docs/APIs/DOC_CloudFunctions.md`](../APIs/DOC_CloudFunctions.md), [`lib/firebase/transactions.ts`](../../lib/firebase/transactions.ts).
- **Anti-fraude / validação de corrida:** *speed gate* e regras associadas — [`lib/services/speed-gate.ts`](../../lib/services/speed-gate.ts), [`Docs/Services/DOC_speed-gate.ts.md`](../Services/DOC_speed-gate.ts.md).
- **Segurança contínua:** endurecimento descrito em [`Docs/Seguranca/SEC_Geral.md`](../Seguranca/SEC_Geral.md) (ex.: rate limit, App Check — itens de backlog).
- **Go-to-market B2C local** e **prospecção B2B** (patrocínios) — atividades de negócio necessárias para validar receita.

**Justificativa:** atividades-chave conectam recursos a proposta de valor; incluem operação server-side já existente (scheduler) e vendas que a landing antecipa.

---

### 1.8 Parcerias-Chave

**Geolocalização e mapas (GPS)**

- **Serviços de geolocalização e APIs de mapas (GPS)** — API de geolocalização do browser, desenho no mapa com **Leaflet**, geometria com **Turf**, tiles **OpenStreetMap** — ver [`Docs/Integracoes/DOC_Leaflet.md`](../Integracoes/DOC_Leaflet.md) e [`Docs/Integracoes/DOC_TurfJS.md`](../Integracoes/DOC_TurfJS.md).

**Distribuição de aplicações**

- **Plataformas de distribuição: Google Play e Apple App Store** — parcerias / presença em lojas como **canal futuro** para apps nativos ou *wrappers*; o **MVP atual** no repositório é **PWA web** (instalação pelo browser, sem binário nas lojas) — ver [`README.md`](../../README.md) e [`Docs/Componentes/DOC_MarketingLanding.md`](../Componentes/DOC_MarketingLanding.md).

**Fornecedores de infraestrutura**

- **Google Firebase** (Auth, Firestore, Cloud Functions) — [`Docs/Integracoes/DOC_FirebaseFirestore.md`](../Integracoes/DOC_FirebaseFirestore.md).
- **Vercel** (hosting) + **Vercel Analytics** em produção — [`Docs/Integracoes/DOC_VercelAnalytics.md`](../Integracoes/DOC_VercelAnalytics.md).

**Ecossistema open-source**

- Leaflet, Turf, shadcn/ui, Radix — [`Docs/Dependencias/DOC_DependenciasNPM.md`](../Dependencias/DOC_DependenciasNPM.md).

**Parcerias comerciais / institucionais (a desenvolver)**

- Clubes e academias locais (aquisição cruzada B2C/B2B).
- **Centro Universitário Piaget — UniPiaget Brasil**, CST ADS 2026.1 (contexto acadêmico do projeto de startups).

**Justificativa:** as parcerias de **mapas/GPS** refletem dependências reais do produto; **Play Store / App Store** entram como **parceiros de canal** alinhados ao roadmap de distribuição, explicitando que o **código atual** entrega sobretudo **PWA**.

---

### 1.9 Estrutura de Custos

**Eixos de custo (visão de negócio)**

- **Hospedagem da plataforma** (Vercel: *frontend*, banda, *compute*) e **manutenção do banco de dados** — Firestore (leituras/escritas, *listeners*, regras, índices), Firebase Auth (MAU), Cloud Functions agendadas (`expireStaleTerritories`). Atenção a custo **variável** quando consultas percorrem muitos documentos — ver [`Docs/Geral/DOC_RelatorioFinal.md`](../Geral/DOC_RelatorioFinal.md).
- **Desenvolvimento contínuo** de novas funcionalidades — **equipe técnica** (*sprints*, revisão de código, QA; o repositório não define *test runner* no `package.json`).
- **Marketing digital**, **divulgação** e **ferramentas de suporte** — conteúdo em redes sociais, **Vercel Analytics** em produção ([`Docs/Integracoes/DOC_VercelAnalytics.md`](../Integracoes/DOC_VercelAnalytics.md)), e-mail comercial e, no futuro, CRM.

**Custos eventuais**

- **Auditoria de segurança** e assessoria **LGPD** — [`Docs/Seguranca/SEC_Geral.md`](../Seguranca/SEC_Geral.md), [`Docs/Geral/DOC_RelatorioSegurancaV2.md`](../Geral/DOC_RelatorioSegurancaV2.md).

**Natureza do custo:** combinação **orientada a valor** (qualidade de UX e privacidade) e **sensível a escala** (*pay-as-you-go* na nuvem), exigindo monitoramento de *quotas* e otimização de consultas.

---

## 2. Tabela de coerência interna (validação)

| Ligação | Como se reforça no projeto |
|---------|----------------------------|
| Segmentos (Suzano) ↔ Canais locais | Geofence em código força foco regional; marketing físico faz sentido |
| Proposta B2C ↔ Funcionalidades | Mapa + corrida + ranking + amigos + troféus implementados e documentados |
| Proposta B2B ↔ Receita | Copy de patrocínio na landing define preço mínimo e **contato** comercial |
| Recursos (Firebase) ↔ Custos | Mesmo fornecedor gera valor e conta variável; riscos listados no relatório final |
| Atividades (scheduler) ↔ Proposta | Expiração mantém dinâmica de jogo e justifica retenção |
| Canais PWA ↔ Proposta | Instalação sem loja reforça barreira zero para o usuário final |

---

## 3. Análise de viabilidade inicial (honesta)

1. **Unit economics sensíveis:** com receita principal em **R$ 49,99/mês por patrocinador**, o número de contas pagantes necessário para cobrir **Firestore a escala** pode ser alto se o crescimento de MAU não for acompanhado de otimização de leituras (ver riscos R3–R4 em [`Docs/Geral/DOC_RelatorioFinal.md`](../Geral/DOC_RelatorioFinal.md)). Tratar como **hipótese a validar** com planilha de quotas Firebase + CAC B2B local.
2. **Mercado geográfico limitado no MVP:** Suzano concentra a jogabilidade territorial; a receita B2B exige **densidade de usuários ativos** na região. Prioridade: validar *retention* semanal antes de escalar patrocínios fora do core geográfico.
3. **Dependência de plataforma:** Google Firebase e Vercel são **single points of failure** comerciais; mitigação: monitorização de custos, *alerts* de quota, roadmap de paginação geográfica.
4. **Monetização B2C (roadmap):** *freemium*, **assinatura premium** e **compras no aplicativo** diversificam receita **sem** substituir, por ora, a prova de mercado B2B — **não implementado** no código; exige gateway de pagamento, termos legais e política de reembolso antes de ir a produção.

---

## 4. Observabilidade e segurança (âmbito desta entrega)

- **Logs:** esta entrega **não altera** serviços nem hooks; não há novos pontos de instrumentação. O inventário de logging do projeto continua centralizado em [`Docs/Logs/DOC_LogsIndex.md`](../Logs/DOC_LogsIndex.md).
- **Segurança:** não foi introduzido código executável; a superfície de ataque do repositório **não muda**. Vulnerabilidades e riscos já conhecidos permanecem documentados em [`Docs/Seguranca/SEC_Geral.md`](../Seguranca/SEC_Geral.md) e documentos `SEC_*` referenciados no índice.

---

## 5. Referências cruzadas (documentação do repositório)

- [`Docs/Geral/DOC_RelatorioFinal.md`](../Geral/DOC_RelatorioFinal.md) — visão única do sistema.
- [`Docs/DOC_IndiceDocumentacao.md`](../DOC_IndiceDocumentacao.md) — índice mestre (esta pasta indexada em “Negócio”).
- [`components/home/marketing-landing.tsx`](../../components/home/marketing-landing.tsx) — posicionamento Venture Geo, gratuitidade, patrocínios, *squad*.

---

## 6. Referências (normas ABNT)

As referências bibliográficas seguem a **ABNT NBR 6023** (ordem alfabética por sobrenome do primeiro autor ou por título, quando aplicável). Citações no texto seguem a **ABNT NBR 10520** (citação direta curta entre aspas; citação de fontes eletrônicas com data de acesso quando obrigatório em trabalhos da instituição).

ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 10520** — Informação e documentação — Apresentação de citações em documentos — Procedimento. Rio de Janeiro: ABNT, 2023.

ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 6023** — Informação e documentação — Referências — Elaboração. Rio de Janeiro: ABNT, 2023.

OSTERWALDER, Alexander; PIGNEUR, Yves. **Business model generation**: a handbook for visionaries, game changers, and challengers. Hoboken: John Wiley & Sons, 2010.

VENTURE GEO. **Territory Run** [recurso eletrônico]. *Repositório de código-fonte*. GitHub, [s.d.]. Disponível em: https://github.com/VentureGeoOficial/territory-web-app. Acesso em: 11 maio 2026.

**Nota:** referências a arquivos internos do repositório (por exemplo, `Docs/*.md`, `app/*.tsx`) são **documentação técnica** anexa ao trabalho; em versão impressa para banca, inclua capturas de tela ou *hash* do *commit* no rodapé, se exigido pelo professor.
