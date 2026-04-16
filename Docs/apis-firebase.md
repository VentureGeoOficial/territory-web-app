# APIs Firebase e Modelo de Dados

Este documento descreve como o TerritoryRun Web utiliza Firebase Authentication e Firestore:
- quais coleções existem e seus campos principais,
- quais funções de acesso (`lib/firebase/*`) existem e o que fazem,
- como os hooks e a UI consomem essas funções,
- diferenças entre modo produção (Firebase) e modo demo (mock).

> Para detalhes campo a campo das coleções, veja também: `Docs/modelo-dados-firestore.md`.

## 1. Visão geral

- **Auth**:
  - Firebase Authentication com email/senha.
  - Sessão é convertida para um `AuthSession` local e armazenada em `auth-store`.
- **Firestore**:
  - Coleções principais:
    - `users` — perfis e estatísticas agregadas.
    - `usernames` — índice único de username.
    - `territories` — territórios capturados no mapa.
    - `friendRequests` — pedidos de amizade.
- **Modo demo**:
  - Quando as variáveis `NEXT_PUBLIC_FIREBASE_*` não estão configuradas, o app:
    - Usa login mock.
    - Não lê/escreve em Firestore; usa Zustand + dados mock.

## 2. Autenticação (`lib/auth/*` + Firebase Auth)

### 2.1 Serviços de Auth (`lib/auth/auth-service.ts`)

- `login(email, password)`:
  - Se `isFirebaseConfigured() === true`:
    - Chama `signInWithEmailAndPassword` do Firebase Auth.
    - Converte o usuário Firebase em `AuthSession` via `firebase-session.ts`.
    - Atualiza `auth-store` com `setSession`.
  - Caso contrário (modo demo):
    - Valida credenciais contra um usuário fixo (`demo@territory.run` / `demo123`).
    - Gera uma sessão mock e grava em `auth-store`.

- `registerWithFirebase(payload)`:
  - Exige Firebase configurado.
  - Fluxo:
    - `createUserWithEmailAndPassword`.
    - `updateProfile` com o nome completo.
    - Chama `createUserProfileAfterSignup` (Firestore) para:
      - Criar `usernames/{slug}`.
      - Criar `users/{uid}` com dados de perfil e stats iniciais.
    - Em caso de falha na transação, remove o usuário recém-criado com `deleteUser` para evitar orfãos.

- `requestPasswordReset(email)`:
  - Em produção, chama `sendPasswordResetEmail`.
  - Em demo, simula delay/erro apenas para UX.

- `signOutRemote()`:
  - Em produção, chama `signOut` no Firebase Auth.
  - Sempre limpa `auth-store` via `logout`.

### 2.2 Conversão de sessão (`lib/auth/firebase-session.ts`)

- Converte `FirebaseUser` → `AuthSession`:
  - Obtém `idToken` e `idTokenResult` (para expiração).
  - Preenche `AuthUser` (uid, email, displayName) e tokens.

### 2.3 Store de Auth (`lib/store/auth-store.ts`)

- Persiste `AuthSession` em `localStorage` (`territoryrun-auth`).
- Fornece `selectIsAuthenticated(state)` para checagens rápidas em UI/guards.

## 3. Perfil de usuário e usernames (`lib/firebase/user-profile.ts`)

### 3.1 Estrutura de dados (Firestore)

Ver `Docs/modelo-dados-firestore.md`:
- `users/{uid}`:
  - Campos de identidade (displayName, email, username, color).
  - Campos antropométricos (dataNascimento, sexo, peso, altura).
  - Stats agregados (`totalAreaM2`, `territoriesCount`, `xp`).
- `usernames/{slug}`:
  - `uid` (dono do username).
  - `createdAt`.

### 3.2 Funções principais

- `createUserProfileAfterSignup({ uid, usernameSlug, profile })`:
  - Executa uma **transação** Firestore:
    - Verifica se `usernames/{slug}` já existe.
    - Se livre, escreve:
      - `usernames/{slug} = { uid, createdAt }`.
      - `users/{uid}` com:
        - perfil completo,
        - `totalAreaM2 = 0`, `territoriesCount = 0`, `xp = 0`.
  - Se o slug já existir, a transação falha (username em uso).

- `ensureUserProfile(uid, displayName, email)`:
  - Usada após login para garantir que `users/{uid}` exista mesmo para contas antigas ou criadas fora deste fluxo.
  - Se não existir, cria um documento mínimo (`displayName`, `email`, stats zerados).

- `getUserProfile(uid)`:
  - Lê `users/{uid}` e devolve o perfil (ou `null`).

## 4. Territórios (`lib/firebase/territories.ts`)

### 4.1 Coleção `territories`

Documento ID: `territory.id` gerado no cliente.
- Campos principais:
  - `userId`, `userName`, `userColor`.
  - `polygonJson` — string com `JSON.stringify(Feature<Polygon>)`.
  - `areaM2`, `centerLng`, `centerLat`.
  - `createdAt`, `updatedAt` (epoch ms).
  - `protectedUntil?`, `status`, `dominanceLevel`, `conquestCount`.

### 4.2 Funções de acesso

- `territoryToFirestoreDoc(t: Territory)`:
  - Converte modelo local em `TerritoryFirestoreDoc` (serializa `polygon` em `polygonJson`).

- `firestoreDocToTerritory(id, data)`:
  - Deserializa `polygonJson` em `Feature<Polygon>`.
  - Reconstrói `Territory` local.

- `subscribeTerritories(onUpdate, onError?)`:
  - Se Firebase não estiver configurado, retorna `null`.
  - Caso contrário:
    - Cria `query(collection(db, 'territories'))` (sem filtros no MVP).
    - Usa `onSnapshot` para observar mudanças e repassar uma lista de `Territory` já deserializados via `onUpdate`.
  - Responsável por alimentar `use-firestore-territory-sync`.

- `saveTerritoryAndUpdateUserStats(territory)`:
  - Se Firebase não estiver configurado, retorna imediatamente.
  - Reforça geofence de Suzano:
    - Valida que `territory.center` está dentro de `SUZANO_BOUNDING_BOX`.
  - Executa `runTransaction`:
    - Lê `users/{territory.userId}`.
    - Calcula `prevArea`, `prevCount`, `prevXp`.
    - Calcula `xpGain = max(50, round(territory.areaM2 / 100))`.
    - Escreve `territories/{territory.id}` com payload.
    - Atualiza `users/{uid}` com novos agregados.

### 4.3 Uso na UI/hooks

- `hooks/use-firestore-territory-sync.ts`:
  - Não fala diretamente com `subscribeTerritories`; em vez disso, usa o **repositório** (`getTerritoryRepository()`).
  - Em modo Firebase:
    - `TerritoryRepository.subscribeTerritories` delega para `subscribeTerritories`.
  - Em modo demo:
    - `TerritoryRepository.subscribeTerritories` assina `territory-store` local (mock).
  - Em ambos, o hook:
    - `setTerritories(list)` na store.
    - Deriva `users` a partir de `territories` (para ranking/local).

- `components/map/map-controls.tsx`:
  - Ao finalizar desenho:
    - Chama `finishDrawing()` (domínio puro via `createTerritoryFromDrawing`).
    - Usa `getTerritoryRepository().saveTerritoryAndUpdateUserStats(territory)` para persistir:
      - Em produção: transação Firebase.
      - Em demo: no-op.

## 5. Ranking global (`lib/firebase/ranking.ts`)

### 5.1 Coleção `users`

Usada para construir o ranking:
- `totalAreaM2` — área total conquistada.
- `territoriesCount` — quantidade de territórios.

### 5.2 Função de acesso

- `subscribeGlobalLeaderboard(onUpdate, max = 50)`:
  - Se Firebase não estiver configurado, retorna `null`.
  - Cria query:
    - `collection(db, 'users')`
    - `orderBy('totalAreaM2', 'desc')`
    - `limit(max)`
  - Em cada snapshot:
    - Monta `RankingEntry[]` com:
      - `userId = doc.id`.
      - `userName = data.displayName ?? 'Corredor'`.
      - `userColor = data.color ?? '#CCFF00'`.
      - `totalAreaM2` e `territoriesCount` com defaults 0.
      - `rank` incremental.

### 5.3 Uso na UI/hooks

- `hooks/use-global-leaderboard.ts`:
  - Usa `getLeaderboardRepository()`:
    - Em produção: delega para `subscribeGlobalLeaderboard` (Firestore).
    - Em demo: calcula ranking local com base em `users` da `territory-store`.
  - Mantém `entries: RankingEntry[]` em estado React para consumo pelas telas de competição.

## 6. Amigos (`friendRequests`)

### 6.1 Modelo (Firestore)

Ver `Docs/modelo-dados-firestore.md`:
- `friendRequests/{id}`:
  - `fromUserId`, `toUserId`.
  - `status: 'pending' | 'accepted' | 'rejected'`.
  - `createdAt` (epoch ms).

### 6.2 Acesso e uso

Embora não exista um arquivo único `lib/firebase/friends.ts`, o padrão é:
- Telas e hooks da área `/amigos` usam Firestore diretamente (ou via pequenos helpers) para:
  - Criar novos pedidos (`status = 'pending'`).
  - Atualizar pedidos para `accepted` / `rejected`.
  - Ler pedidos onde `fromUserId == uid` ou `toUserId == uid` (usando índices compostos definidos em `firestore.indexes.json`).

As `firestore.rules` garantem que apenas remetente/destinatário vejam/alterem os pedidos.

## 7. Adapter de dados (`lib/data/territory-repository.ts`)

Como mencionado em `Docs/arquitetura-web.md`, os adapters são a forma como a UI fala com Firebase **ou** com dados mock.

- `TerritoryRepository`:
  - Firebase:
    - `subscribeTerritories` → `lib/firebase/territories.subscribeTerritories`.
    - `saveTerritoryAndUpdateUserStats` → `lib/firebase/territories.saveTerritoryAndUpdateUserStats`.
  - Mock:
    - `subscribeTerritories`:
      - Usa `useTerritoryStore.getState().territories` + `useTerritoryStore.subscribe` para replicar o comportamento de stream.
    - `saveTerritoryAndUpdateUserStats`:
      - No-op (estado local já foi atualizado pela store).

- `LeaderboardRepository`:
  - Firebase:
    - `subscribeGlobalLeaderboard` → `lib/firebase/ranking.subscribeGlobalLeaderboard`.
  - Mock:
    - Reconstrói `RankingEntry[]` a partir de `useTerritoryStore.getState().users`.
    - Usa `useTerritoryStore.subscribe` para reagir a mudanças.

Isso permite que os hooks (`use-firestore-territory-sync`, `use-global-leaderboard`) e componentes não precisem se preocupar se estão em modo demo ou produção.

## 8. Modo demo vs produção (resumo)

- **Produção (Firebase ON)**:
  - Auth real.
  - Perfis e usernames persistidos.
  - Territórios e stats transacionais no Firestore.
  - Ranking e amigos usam coleções reais.

- **Demo (Firebase OFF)**:
  - Auth mock com usuário demo.
  - Dados de mapa/territórios/ranking/integrantes são mockados via `territory-store`.
  - Writes para Firestore estão efetivamente desativadas nas funções de API.

## 9. Referências rápidas

- Modelo de dados:
  - `Docs/modelo-dados-firestore.md`
- Regras de território (domínio):
  - `Docs/regras-territorio.md`
- Arquitetura geral:
  - `Docs/arquitetura-web.md`

