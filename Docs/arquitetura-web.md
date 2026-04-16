# Arquitetura TerritoryRun Web

## 1. Visão geral

**TerritoryRun Web** é uma aplicação Next.js (App Router) focada em:
- captura de territórios via desenho no mapa (Leaflet),
- gamificação (XP, ranking, troféus, amigos),
- sincronização opcional com Firebase (Auth + Firestore),
- modo demo totalmente local (mock) quando o Firebase não está configurado.

Principais tecnologias:
- **Next.js App Router** (`app/`) para rotas e layout.
- **React + shadcn/ui** para componentes de UI.
- **Zustand** para estado de autenticação e de mapa/territórios.
- **Firebase Auth + Firestore** para autenticação e persistência em nuvem.
- **Leaflet / react-leaflet** para o mapa e polígonos GeoJSON.

## 2. Organização de pastas

- `app/` — rotas e layouts (App Router).
  - `app/layout.tsx` — layout raiz; aplica tema e `Providers` (tema + auth).
  - `app/(authenticated)/layout.tsx` — layout das rotas autenticadas (envolve em `AuthGuard`).
  - `app/(authenticated)/mapa/page.tsx` — página principal do mapa.
  - `app/(authenticated)/competicao/page.tsx` — ranking global / amigos.
  - `app/(authenticated)/amigos/page.tsx` — fluxo de amizades.
  - `app/(authenticated)/trofeus/page.tsx` — troféus / conquistas.
  - `app/login`, `app/cadastro`, `app/esqueci-senha` — fluxos públicos de auth.

- `components/` — componentes de UI e layout.
  - `components/layout/header.tsx` — header principal (menu desktop + mobile sheet).
  - `components/layout/authenticated-shell.tsx` — shell geral de páginas autenticadas (exceto mapa full-screen).
  - `components/map/*` — mapa em si (`TerritoryMap`), wrapper e controles.
  - `components/territory/*` — sidebar de territórios e cards.
  - `components/auth/*` — formulários de login, cadastro, esqueci senha.
  - `components/ui/*` — biblioteca shadcn/ui customizada (botões, cards, dialogs, skeletons etc.).

- `lib/` — camada de domínio, estado e integrações.
  - `lib/territory/*` — **domínio de território** (tipos, geo, geração de polígono, regras puras).
  - `lib/store/*` — stores Zustand de auth (`auth-store`) e territórios/mapa (`territory-store`).
  - `lib/firebase/*` — acesso direto ao Firebase (client, config, Firestore, user-profile, ranking, territories).
  - `lib/data/*` — **adapters** (repos) para unificar modo mock vs Firebase.
  - `lib/auth/*` — serviços e tipos de autenticação (schemas Zod, auth-service, conversão de sessão).
  - `lib/gamification/*` — regras de troféus.

- `hooks/` — hooks que conectam domínio + repos + UI.
  - `use-firestore-territory-sync` — sincroniza Firestore → `territory-store`.
  - `use-global-leaderboard`, `use-leaderboard-preview` — ranking global/mock.
  - `use-rate-limit` — rate limiting no cliente.
  - Outros hooks auxiliares (friends, contagem etc.).

- `Docs/` — documentação funcional/técnica.

## 3. Fluxo de alto nível (mermaid)

```mermaid
flowchart LR
  user[User] --> browser[Browser/Next.js]

  subgraph ui[UI (app/ + components/)]
    landing[/"/"/]
    loginRoute[/"/login"/]
    mapaRoute[/"/mapa"/]
    competicaoRoute[/"/competicao"/]
    amigosRoute[/"/amigos"/]
    trofeusRoute[/"/trofeus"/]
  end

  subgraph state[Estado (Zustand)]
    authStore[auth-store]
    territoryStore[territory-store]
  end

  subgraph domain[Domínio]
    territoryDomain[territory/domain.ts]
    territoryGeo[territory/geo.ts]
    territoryGenerator[territory/territory-generator.ts]
  end

  subgraph data[Dados / Integracao]
    firebaseClient[lib/firebase/*]
    repos[lib/data/territory-repository.ts]
    hooksSync[hooks/use-firestore-territory-sync.ts]
  end

  user --> browser
  browser --> ui
  ui --> state
  ui --> hooksSync
  state --> domain
  hooksSync --> repos
  repos --> firebaseClient
  firebaseClient -->|"Auth/Firestore"| firebase[Firebase]
```

## 4. Camadas em detalhe

### 4.1 UI e rotas (Next.js App Router)

- Responsável por:
  - Definir as rotas da aplicação (`/`, `/login`, `/mapa`, `/competicao`, `/amigos`, `/trofeus`).
  - Compor layouts (header, shell autenticado, sidebar, mapa).
  - Orquestrar hooks e stores, sem conter regras de negócio pesadas.
- Padrões:
  - Rotas autenticadas ficam sob `app/(authenticated)/` e usam `AuthGuard`.
  - Componentes maiores são divididos por domínio (ex.: `components/map`, `components/territory`, `components/home`).
  - UI usa shadcn/ui customizado para consistência visual (botões, cards, sheets, skeletons).

### 4.2 Estado (Zustand)

**`lib/store/auth-store.ts`**
- Mantém sessão do usuário autenticado (dados básicos + tokens).
- Persiste em `localStorage` com chave `territoryrun-auth`.
- API:
  - `setSession(session)` — grava sessão vinda do Firebase/AuthService.
  - `logout()` — limpa sessão local.
  - Selector `selectIsAuthenticated` — verifica se há usuário + accessToken.

**`lib/store/territory-store.ts`**
- Mantém:
  - Lista de territórios (`territories`) e usuários derivados (`users`).
  - ID do usuário atual (`currentUserId`).
  - Estado do mapa: centro, zoom, modo (`view`/`draw`/`simulate`), seleção de território.
  - Estado de desenho: pontos (`drawingPoints`), flag `isDrawing`.
  - Filtros para listagem.
- Principais ações:
  - Dados: `setTerritories`, `addTerritory`, `updateTerritory`, `removeTerritory`, `setUsers`.
  - Mapa: `setMapCenter`, `setMapZoom`, `setMapMode`, `selectTerritory`.
  - Desenho: `startDrawing`, `addDrawingPoint`, `removeLastDrawingPoint`, `clearDrawing`, `finishDrawing`.
  - Filtros/computed: `getFilteredTerritories`, `getUserTerritories`, `getDisputedTerritories`, `getTotalAreaForUser`.
  - Mock: `initMockData()` — popula usuários/territórios de exemplo.
- Importante:
  - `finishDrawing` não implementa mais diretamente regras de domínio; delega para `createTerritoryFromDrawing` em `lib/territory/domain.ts` e apenas aplica o resultado ao estado.

### 4.3 Domínio de território (`lib/territory/*`)

- **`types.ts`** — tipos centrais:
  - `Territory`, `User`, `TerritoryStatus`, `DominanceLevel`, `TerritoryConfig`, `MapMode`, `RankingEntry` etc.
  - `DEFAULT_TERRITORY_CONFIG` — configuração padrão de criação (buffer, minPoints, tempo mínimo, tempo de proteção).
- **`geo.ts`** — funções geo utilitárias:
  - Distâncias Haversine, conversão de pontos para GeoJSON positions.
  - Bounding boxes, formatação de área/distância/tempo, geração de cores estáveis de usuário.
- **`territory-generator.ts`** — integração com Turf:
  - `validateRoute` — valida sessões de tracking (herdado da visão mobile).
  - `calculateTerritoryFromPoints` / `calculateTerritoryFromPositions` — recebe pontos e devolve `TerritoryCalculation` (polígono bufferizado, área m², centro, bounding box).
  - `checkTerritoryIntersection`, `calculateIntersectionArea`, `simplifyPolygon`.
- **`domain.ts`** — regras de negócio de criação de território:
  - `createTerritoryFromDrawing(params)`:
    - Recebe pontos desenhados, usuário atual, territórios existentes e config.
    - Usa `calculateTerritoryFromPositions` para gerar o polígono.
    - Aplica geofence de Suzano (rejeita se centro fora da bounding box).
    - Detecta interseções com territórios existentes (marca novo + existentes como `disputed`).
    - Define status, `protectedUntil`, `dominanceLevel` inicial, `conquestCount`.
    - Retorna `{ territories: [...territoriesAtualizados, novo], newTerritory }`.

Essa camada é **pura** (sem efeitos externos) e pode ser reutilizada em Cloud Functions ou outros clientes.

### 4.4 Integração com Firebase (`lib/firebase/*`)

- **`client.ts`**:
  - Inicializa `FirebaseApp`, `Auth` e `Firestore` no cliente (lazy, singleton).
- **`config.ts`**:
  - Lê variáveis `NEXT_PUBLIC_FIREBASE_*` e expõe `isFirebaseConfigured()`.
  - Define se o app está em modo **produção** (Firebase ativo) ou **demo** (mock).
- **`auth-service.ts`**:
  - `login(email, password)` — usa Firebase Auth se configurado, senão fallback mock.
  - `registerWithFirebase` — fluxo de cadastro (Auth + Firestore via `createUserProfileAfterSignup`).
  - `requestPasswordReset(email)` — reset de senha via Firebase ou mock.
  - `signOutRemote()` — logout no Firebase.
- **`user-profile.ts`**:
  - `createUserProfileAfterSignup` — transação que cria `usernames/{slug}` + `users/{uid}`.
  - `ensureUserProfile` — garante que `users/{uid}` exista no primeiro login.
- **`territories.ts`**:
  - `subscribeTerritories` — ouve coleção `territories` (MVP: sem filtros; futura extensão para viewport/geohash).
  - `saveTerritoryAndUpdateUserStats` — transação que escreve um território e atualiza `totalAreaM2`, `territoriesCount`, `xp` em `users/{uid}` (respeitando geofence).
- **`ranking.ts`**:
  - `subscribeGlobalLeaderboard` — query em `users` ordenando por `totalAreaM2` desc, com `limit`.

### 4.5 Adapter de dados (`lib/data/territory-repository.ts`)

- Define interfaces:
  - `TerritoryRepository`:
    - `subscribeTerritories(onUpdate, onError?)` — assina a fonte de territórios.
    - `saveTerritoryAndUpdateUserStats(territory)` — persiste território + counters.
  - `LeaderboardRepository`:
    - `subscribeGlobalLeaderboard(onUpdate, max?)` — assina ranking.
- Implementações:
  - **Firebase**:
    - Usa `subscribeTerritories`, `saveTerritoryAndUpdateUserStats` e `subscribeGlobalLeaderboard`.
  - **Mock**:
    - Usa `useTerritoryStore` como fonte de verdade local (subscribe ao Zustand).
    - `saveTerritoryAndUpdateUserStats` é no-op (apenas estado local).
    - Ranking é reconstruído a partir de `users` da store.
- Factories:
  - `getTerritoryRepository()` e `getLeaderboardRepository()` decidem entre Firebase ou mock com base em `isFirebaseConfigured()`.

Essa camada garante que a UI e os hooks consumam **uma interface única**, independentemente de estar em demo ou produção.

### 4.6 Hooks de integração (`hooks/*`)

- **`use-firestore-territory-sync.ts`**:
  - Usa `getTerritoryRepository()` para assinar territórios.
  - Atualiza `territory-store.setTerritories`.
  - Deriva `users` a partir de `territories` (`deriveUsersFromTerritories`).
- **`use-global-leaderboard.ts`**:
  - Usa `getLeaderboardRepository()` para assinar ranking.
  - Em produção, reflete `users` do Firestore; em mock, constrói a partir de `users` locais.
- **`use-rate-limit.ts`**:
  - Implementa rate limiting no cliente (mínimo intervalo, janelas e tentativas).
  - Usado em login, cadastro, pedidos de amizade.

## 5. Modo demo vs produção

- **Produção (Firebase configurado)**:
  - Auth real (email/senha) via Firebase Auth.
  - Perfis persistidos em `users` e `usernames`.
  - Territórios salvos em `territories` com counters e XP atualizados em transação.
  - Ranking global derivado de `users` no Firestore.
  - Amigos e troféus usam coleções reais (`friendRequests` e dados de usuário).

- **Demo (sem Firebase)**:
  - Login mock (`demo@territory.run` / `demo123`).
  - `useFirestoreTerritorySync` usa o repositório mock (Zustand + `initMockData`).
  - Territórios e ranking vivem apenas no cliente (sem persistência em nuvem).
  - Cadastro real é desabilitado (form mostra aviso).

## 6. Onde mexer (guia rápido para devs)

- **Alterar rotas / layout**:
  - Arquivos em `app/` e `components/layout/*`.
- **Mudar regras de território (domínio)**:
  - `lib/territory/domain.ts`, `lib/territory/territory-generator.ts`, `lib/territory/types.ts`.
- **Mudar persistência em Firestore**:
  - `lib/firebase/territories.ts`, `lib/firebase/ranking.ts`, `firestore.rules`, `firestore.indexes.json`.
- **Mudar comportamento de mock / demo**:
  - `lib/data/territory-repository.ts`, `lib/store/territory-store.ts` (`initMockData`), `lib/auth/auth-service.ts` (login mock).
- **Ajustar fluxo de Auth / cadastro**:
  - `lib/auth/auth-service.ts`, `lib/firebase/user-profile.ts`, `lib/auth/schemas.ts`, `components/auth/*`, `app/login`, `app/cadastro`, `app/esqueci-senha`.

