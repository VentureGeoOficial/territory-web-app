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

---

## 1. Canvas — os nove blocos (síntese)

### 1.1 Segmentos de Clientes

**B2C (utilizador final — gratuito)**

- Corredores e caminhantes amadores na região de **Suzano-SP e Grande SP** (geofence atual do produto).
- Pessoas 18–35 anos interessadas em **gamificação fitness**, competição saudável e experiências tipo *real-life gaming* no mapa.
- Grupos locais (clubes de corrida, treinos em parque, comunidades de bairro).

**B2B (pagante — receita)**

- Lojas esportivas, academias e marcas de nutrição/vestuário que buscam **público ativo e geolocalizado**.
- Comércio de bairro com interesse em **exposição contextual** junto ao mapa e às rotas.
- (Médio prazo) prefeituras / turismo para **eventos e ativações** em espaço público.

**Justificativa:** o MVP técnico restringe criação de território à caixa `SUZANO_BOUNDING_BOX` — ver [`lib/territory/regions.ts`](../../lib/territory/regions.ts) e [`Docs/Funcoes/DOC_Regions.md`](../Funcoes/DOC_Regions.md). A landing posiciona o produto como gratuito e descreve público esportivo urbano — ver [`components/home/marketing-landing.tsx`](../../components/home/marketing-landing.tsx).

---

### 1.2 Proposta de Valor

**Para o corredor (B2C)**

- Transformar corrida/caminhada em **conquista territorial visível** no mapa (loop fechado, área em m², estados de território).
- **Ranking global e entre amigos**, troféus e progressão por metas — ver [`Docs/Telas/DOC_TelaCompeticao.md`](../Telas/DOC_TelaCompeticao.md), [`Docs/Funcoes/DOC_Trophies.md`](../Funcoes/DOC_Trophies.md), [`Docs/Funcoes/DOC_Scoring.md`](../Funcoes/DOC_Scoring.md).
- **Disputa territorial** (captura “hostil” com regras no servidor) — ver [`Docs/Fluxos/DOC_FluxoCorridaECaptura.md`](../Fluxos/DOC_FluxoCorridaECaptura.md) e [`Docs/Geral/DOC_RelatorioFinal.md`](../Geral/DOC_RelatorioFinal.md) (fluxo mapa → corrida → captura).
- **PWA** sem loja de apps; instalação pelo browser — [`Docs/Componentes/DOC_MarketingLanding.md`](../Componentes/DOC_MarketingLanding.md) + [`lib/pwa/use-install-prompt.ts`](../../lib/pwa/use-install-prompt.ts).
- **100% gratuito** para utilizadores — texto explícito na landing (`marketing-landing.tsx`).

**Para a marca (B2B)**

- Acesso a **audiência altamente engajada** (sessão de treino = atenção sustentada) e **geolocalizada por bairro** (coerente com o mapa).
- **Patrocínios e anúncios** integrados à experiência — preço de entrada declarado na landing (**R$ 49,99/mês**) e contacto `patrocinio@venturegeo.com.br`.

**Justificativa:** a proposta B2C está implementada nas rotas autenticadas (`/mapa`, `/competicao`, `/amigos`, `/trofeus`, …) documentadas em [`Docs/Telas/DOC_TelasIndex.md`](../Telas/DOC_TelasIndex.md). A proposta B2B está na secção “Patrocinios e Anuncios” da landing — ficheiro [`components/home/marketing-landing.tsx`](../../components/home/marketing-landing.tsx).

---

### 1.3 Canais

**Aquisição B2C**

- **Web / PWA** na raiz `/` com landing de marketing — ver [`Docs/Telas/DOC_TelaHome.md`](../Telas/DOC_TelaHome.md) e [`app/page.tsx`](../../app/page.tsx).
- **Redes sociais** (Instagram, Facebook, LinkedIn) na própria landing — ícones e links em `marketing-landing.tsx`.
- **Marketing local** (eventos, clubes, parques em Suzano / Grande SP) — coerente com geofence atual.

**Entrega B2C**

- Rotas autenticadas sob `(authenticated)` — mapa, competição, amigos, troféus, conta, ajuda — ver [`README.md`](../../README.md) e índice de telas.

**Aquisição / entrega B2B**

- **E-mail comercial** `patrocinio@venturegeo.com.br` (declarado na landing).
- **Proposta consultiva** (briefing de campanha, formatos de mídia no mapa) — hipótese operacional alinhada ao produto atual (mapa + marca Venture Geo).

**Justificativa:** canais digitais estão no código da landing e na estrutura de rotas Next.js; não há portal self-service de anunciantes versionado — manter explícito como evolução.

---

### 1.4 Relacionamento com Clientes

**B2C**

- **Self-service**: cadastro, login (e-mail/senha + Google), recuperação de senha — [`Docs/Integracoes/DOC_FirebaseAuth.md`](../Integracoes/DOC_FirebaseAuth.md), fluxos em [`Docs/Fluxos/`](../Fluxos/).
- **Comunidade e retenção**: amigos e contagens — serviço [`lib/services/friends-service.ts`](../../lib/services/friends-service.ts) e [`Docs/Services/DOC_FriendsService.md`](../Services/DOC_FriendsService.md).
- **Suporte leve**: FAQ em `/ajuda` — [`Docs/Telas/DOC_TelaAjuda.md`](../Telas/DOC_TelaAjuda.md).
- **Transparência / confiança**: `/termos`, `/privacidade`, documentação LGPD em [`Docs/lgpd.md`](../lgpd.md) (legado) e políticas nas telas.

**B2B**

- Relacionamento **consultivo e direto** (e-mail + reunião comercial), com pacotes mensais anunciados na landing.

**Justificativa:** não há call center nem CRM no repositório; o modelo de relacionamento inferido é o que a arquitetura e a UI suportam hoje.

---

### 1.5 Fontes de Receita

**Principal (declarada no produto)**

- **Patrocínios e anúncios B2B** — pacotes a partir de **R$ 49,99/mês** (landing).

**Secundárias (hipóteses coerentes — não implementadas como billing no código)**

- **Eventos patrocinados** (desafios temporários, geofence ampliada sob contrato).
- **Licenciamento / white-label** para prefeitura ou clube (médio prazo).
- **Subscrição B2C premium** (ex.: estatísticas avançadas) — *não existe no código*; manter apenas como hipótese de diversificação; o posicionamento atual é **100% gratuito** para o utilizador.

**Justificativa:** não há Stripe, IAP ou módulo de faturação no inventário de dependências — ver [`Docs/Dependencias/DOC_DependenciasNPM.md`](../Dependencias/DOC_DependenciasNPM.md). A única receita textualmente comprometida no produto é B2B na landing.

---

### 1.6 Recursos-Chave

- **Stack de produto:** Next.js, React, Firebase (Auth + Firestore), Leaflet, Turf, Zustand — [`Docs/Geral/DOC_RelatorioFinal.md`](../Geral/DOC_RelatorioFinal.md), [`Docs/Dependencias/DOC_DependenciasNPM.md`](../Dependencias/DOC_DependenciasNPM.md).
- **Dados e modelo:** coleções e regras Firestore — [`Docs/Banco/DOC_FirestoreSchema.md`](../Banco/DOC_FirestoreSchema.md), [`firestore.rules`](../../firestore.rules).
- **Lógica de domínio:** territórios, scoring, troféus — [`Docs/Funcoes/DOC_FuncoesIndex.md`](../Funcoes/DOC_FuncoesIndex.md).
- **Função agendada** `expireStaleTerritories` — [`Docs/APIs/DOC_CloudFunctions.md`](../APIs/DOC_CloudFunctions.md).
- **Marca e IP:** Venture Geo, mascote Speed, assets em `public/` e landing.
- **Equipa (squad):** Leonardo Souza Bastos, Henrique Casagrande, Marcelo Candido — secção “Nossa Squad” em `marketing-landing.tsx`.

**Justificativa:** recursos-chave são os ativos sem os quais o modelo deixa de funcionar; listados acima estão versionados ou declarados no código.

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

**Fornecedores de infraestrutura**

- **Google Firebase** (Auth, Firestore, Cloud Functions) — [`Docs/Integracoes/DOC_FirebaseFirestore.md`](../Integracoes/DOC_FirebaseFirestore.md).
- **Vercel** (hosting) + **Vercel Analytics** em produção — [`Docs/Integracoes/DOC_VercelAnalytics.md`](../Integracoes/DOC_VercelAnalytics.md).
- **OpenStreetMap** (tiles via Leaflet) — uso comum em apps mapa; ver integração Leaflet em [`Docs/Integracoes/DOC_Leaflet.md`](../Integracoes/DOC_Leaflet.md).

**Ecossistema open-source**

- Leaflet, Turf, shadcn/ui, Radix — [`Docs/Dependencias/DOC_DependenciasNPM.md`](../Dependencias/DOC_DependenciasNPM.md).

**Parcerias comerciais / institucionais (a desenvolver)**

- Clubes e academias locais (aquisição cruzada B2C/B2B).
- **Centro Universitário Piaget — UniPiaget Brasil**, CST ADS 2026.1 (contexto académico do projeto de startups).

**Justificativa:** parcerias tecnológicas são lock-in operacional; parcerias locais são necessárias para escalar utilizadores dentro da geofence atual.

---

### 1.9 Estrutura de Custos

**Variáveis (nuvem e uso)**

- **Firestore:** leituras/escritas e *listeners* — risco de custo com **snapshot amplo** e API que percorre coleção; ver secção “Gargalos” em [`Docs/Geral/DOC_RelatorioFinal.md`](../Geral/DOC_RelatorioFinal.md) (itens sobre `subscribeTerritories` e `territories.get()` na captura).
- **Firebase Auth** (MAU acima do free tier).
- **Cloud Functions** agendadas (`expireStaleTerritories` a cada 60 min) — [`Docs/APIs/DOC_CloudFunctions.md`](../APIs/DOC_CloudFunctions.md).
- **Vercel:** largura de banda e compute.

**Fixos**

- **Pessoas:** squad técnica (em operação real, maior fatia do burn rate).
- **Domínio, design, ferramentas** (e-mail profissional, analytics).

**Eventuais**

- **Auditoria de segurança** e assessoria LGPD — referências em [`Docs/Seguranca/SEC_Geral.md`](../Seguranca/SEC_Geral.md) e [`Docs/Geral/DOC_RelatorioSegurancaV2.md`](../Geral/DOC_RelatorioSegurancaV2.md).

**Natureza do custo:** misto **value-driven** (qualidade, privacidade, UX) e **cost-driven** (Firebase escala com uso — exige otimização contínua de queries).

---

## 2. Tabela de coerência interna (validação)

| Ligação | Como se reforça no projeto |
|---------|----------------------------|
| Segmentos (Suzano) ↔ Canais locais | Geofence em código força foco regional; marketing físico faz sentido |
| Proposta B2C ↔ Funcionalidades | Mapa + corrida + ranking + amigos + troféus implementados e documentados |
| Proposta B2B ↔ Receita | Copy de patrocínio na landing define preço mínimo e contacto comercial |
| Recursos (Firebase) ↔ Custos | Mesmo fornecedor gera valor e conta variável; riscos listados no relatório final |
| Atividades (scheduler) ↔ Proposta | Expiração mantém dinâmica de jogo e justifica retenção |
| Canais PWA ↔ Proposta | Instalação sem loja reforça barreira zero para utilizador final |

---

## 3. Análise de viabilidade inicial (honesta)

1. **Unit economics sensíveis:** com receita principal em **R$ 49,99/mês por patrocinador**, o número de contas pagantes necessário para cobrir **Firestore a escala** pode ser alto se o crescimento de MAU não for acompanhado de otimização de leituras (ver riscos R3–R4 em [`Docs/Geral/DOC_RelatorioFinal.md`](../Geral/DOC_RelatorioFinal.md)). Tratar como **hipótese a validar** com planilha de quotas Firebase + CAC B2B local.
2. **Mercado geográfico limitado no MVP:** Suzano concentra a jogabilidade territorial; a receita B2B exige **densidade de utilizadores ativos** na região. Prioridade: validar *retention* semanal antes de escalar patrocínios fora do core geográfico.
3. **Dependência de plataforma:** Google Firebase e Vercel são **single points of failure** comerciais; mitigação: monitorização de custos, *alerts* de quota, roadmap de paginação geográfica.
4. **Pivot futuro (opcional):** subscrição B2C leve para *insights premium* poderia diversificar receita **sem** retirar o free tier — **não implementado**; manter fora do canvas como receita “real” até existir código e termos legais.

---

## 4. Observabilidade e segurança (âmbito desta entrega)

- **Logs:** esta entrega **não altera** serviços nem hooks; não há novos pontos de instrumentação. O inventário de logging do projeto continua centralizado em [`Docs/Logs/DOC_LogsIndex.md`](../Logs/DOC_LogsIndex.md).
- **Segurança:** não foi introduzido código executável; a superfície de ataque do repositório **não muda**. Vulnerabilidades e riscos já conhecidos permanecem documentados em [`Docs/Seguranca/SEC_Geral.md`](../Seguranca/SEC_Geral.md) e documentos `SEC_*` referenciados no índice.

---

## 5. Referências cruzadas (leitura recomendada)

- [`Docs/Geral/DOC_RelatorioFinal.md`](../Geral/DOC_RelatorioFinal.md) — visão única do sistema.
- [`Docs/DOC_IndiceDocumentacao.md`](../DOC_IndiceDocumentacao.md) — índice mestre (esta pasta indexada em “Negócio”).
- [`components/home/marketing-landing.tsx`](../../components/home/marketing-landing.tsx) — posicionamento Venture Geo, gratuitidade, patrocínios, squad.
