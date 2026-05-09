# DOC_RelatorioFinal

**Projeto:** TerritoryRun Web  
**Data do relatório:** 2026-05-09  
**Método:** engenharia reversa do código-fonte + configurações na raiz; sem inferências sobre ambientes não versionados.

---

## 1. Estrutura encontrada

- **Next.js 16** App Router (`app/`), **React 19**, **TypeScript strict**.
- Estado global **Zustand** (`auth-store`, `territory-store`, `run-store`).
- **Firebase** cliente (Auth + Firestore) + **firebase-admin** apenas em API route e Cloud Functions.
- **Uma** HTTP API própria: `POST /api/territories/capture`.
- **functions/** com scheduler `expireStaleTerritories` (Firebase CLI, não Vercel).
- UI **shadcn/ui** (~58 ficheiros em `components/ui/`) + componentes de domínio em `components/{auth,home,layout,map,territory,brand}`.

Árvore de documentação gerada: pastas `Docs/{Arquitetura,APIs,Banco,Componentes,Configuracoes,Dependencias,Eventos,Fluxos,Funcoes,Geral,Hooks,Integracoes,Logs,Permissoes,Seguranca,Telas}` + ficheiros legacy em `Docs/*.md` e `Docs/Firebase/*`.

---

## 2. Arquitetura identificada

- **Camada apresentação:** páginas `app/**`, componentes cliente, Leaflet carregado sem SSR (`dynamic` em `map-wrapper`).
- **Camada estado:** Zustand + hidratação persist para auth.
- **Camada integração:** `lib/firebase/*`, `lib/auth/*`, `lib/services/location-service.ts`.
- **Domínio puro:** `lib/territory/*`, `lib/gamification/trophies.ts`.
- **Adaptador fino:** `lib/data/territory-repository.ts` (sem implementação mock — retorna `null` se Firebase off).

Fluxo crítico: **mapa** → corrida/captura → Firestore transação cliente **ou** API Admin para captura hostil.

---

## 3. Riscos e vulnerabilidades (resumo)

| ID | Área | Severidade | Resumo |
|----|------|------------|--------|
| R1 | Tokens em `localStorage` | MÉDIO | Superfície XSS |
| R2 | `typescript.ignoreBuildErrors: true` | MÉDIO | Erros TS podem ir para produção |
| R3 | API capture lê coleção `territories` completa | ALTO (operacional) | Custo/latência; vetor de abuso por utilizador autenticado |
| R4 | Sem rate limit servidor na capture | MÉDIO | Depende de quotas Firebase/Vercel |
| R5 | Territórios legíveis publicamente nas rules | MÉDIO | Por design; scraping possível |
| R6 | Duplicação `useLeaderboardPreview` vs repositório | BAIXO | Manutenção |

Detalhe classificado em [SEC_*.md](../Seguranca/) e [SEC_firebase-env.md](../Seguranca/firebase-config/SEC_firebase-env.md).

---

## 4. Código morto / órfãos

Documentado em [DOC_CodigoMortoOrfaos.md](../Dependencias/DOC_CodigoMortoOrfaos.md):

- **`HomePageClient` não referenciado** — landing atual só usa `MarketingLanding` em [`app/page.tsx`](../../app/page.tsx).
- **`buildFromStore`** não usado em `use-global-leaderboard.ts`.
- **`components/ui/use-mobile.tsx`** duplica hook da pasta `hooks/`.

---

## 5. Gargalos de performance / escala

1. **`subscribeTerritories`** sem limite geográfico — snapshot de coleção inteira.
2. **API capture:** `db.collection('territories').get()` por pedido — O(N) territórios.
3. **Ranking:** query em `publicProfiles` com limite — aceitável; consistência depende de escritas transacionais.

---

## 6. Melhorias recomendadas (prioridade)

1. **Integrar ou remover `HomePageClient`** para alinhar UX produto (dashboard vs landing na `/`).
2. **Desativar `ignoreBuildErrors`** após corrigir erros TS.
3. **Paginar / indexar territórios** por região ou limite para snapshot e para API capture.
4. **Rate limit** na API capture (Edge middleware ou quota Firebase).
5. **Remover `console.log` de debug** (`home-page-client`, `territory-map` se existir).
6. **App Check** Firebase para reduzir abuso da API key pública.
7. **Unificar** leaderboard preview para usar sempre `getLeaderboardRepository()`.

---

## 7. Módulos críticos (falha = produto parado)

| Módulo | Motivo |
|--------|--------|
| [`lib/firebase/client.ts`](../../lib/firebase/client.ts) | Sem isto não há mapa/auth Firestore |
| [`lib/config/firebase-env.ts`](../../lib/config/firebase-env.ts) | Validação env pública |
| [`lib/config/firebase-admin-env.ts`](../../lib/config/firebase-admin-env.ts) | API capture |
| [`lib/firebase/transactions.ts`](../../lib/firebase/transactions.ts) | Captura hostil atómica |
| [`components/auth/auth-guard.tsx`](../../components/auth/auth-guard.tsx) | Proteção de rotas |
| [`hooks/use-firestore-territory-sync.ts`](../../hooks/use-firestore-territory-sync.ts) | Dados do mapa |

---

## 8. Mapa mental único

```
Visitante → Landing (/) → Login → AuthGuard → Mapa + Firestore sync
                ↘ Cadastro → perfil transacional → Mapa

Utilizador → Corrida GPS → (normal) `POST /api/runs/complete` | (hostil) `POST /api/territories/capture` → Admin SDK → Firestore

Scheduler (GCP) → expireStaleTerritories → atualiza territórios + users/publicProfiles
```

---

## 9. Índice da documentação técnica gerada

Começar por: [DOC_TelasIndex.md](../Telas/DOC_TelasIndex.md), [DOC_ComponentesIndex.md](../Componentes/DOC_ComponentesIndex.md), [DOC_ServicesIndex.md](../Services/DOC_ServicesIndex.md), [DOC_API_Index.md](../APIs/DOC_API_Index.md), [SEC_Geral.md](../Seguranca/SEC_Geral.md).

---

## 10. Próximo passo sugerido ao equipa de desenvolvimento

1. Rever este relatório com produto para decidir comportamento da rota `/` (dashboard vs marketing).
2. Planear sprint de **hardening**: build TS, rate limit, otimização queries Firestore.
3. Manter documentação: atualizar `DOC_*` quando alterar contratos de API ou rules.
