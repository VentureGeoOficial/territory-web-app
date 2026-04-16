# Modo Demo (Mock) vs Produção (Firebase)

Este documento explica as diferenças entre rodar o TerritoryRun Web em modo demo (sem Firebase) e em modo produção (com Firebase configurado).

## 1. Como o modo é escolhido

- Arquivo: `lib/firebase/config.ts`.
- Função: `isFirebaseConfigured()`:
  - Retorna `true` se todas as variáveis `NEXT_PUBLIC_FIREBASE_*` estiverem presentes (`API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `APP_ID` etc.).
  - Caso contrário, o app assume **modo demo**.

Essa flag é usada em vários pontos:
- `auth-service` (para escolher entre login/cadastro reais ou mock).
- `use-firestore-territory-sync` e `use-global-leaderboard` (via repositórios em `lib/data/territory-repository.ts`).
- Páginas e formulários que exibem avisos quando Firebase não está disponível.

## 2. Modo demo (mock)

### 2.1 Objetivo

- Permitir que qualquer dev ou stakeholder rode o app localmente sem precisar criar um projeto Firebase.
- Servir como ambiente de demonstração seguro (sem gravação de dados reais).

### 2.2 Comportamento

- **Auth**:
  - `login` aceita somente credenciais fixas:
    - Email: `demo@territory.run`
    - Senha: `demo123`
  - `registerWithFirebase` mostra aviso e não cria conta (cadastro real desabilitado).
  - `requestPasswordReset` apenas simula sucesso/erro.

- **Dados de mapa e ranking**:
  - `territory-store.initMockData()` é chamado quando `/mapa` carrega com lista de territórios vazia:
    - Cria usuários e territórios de exemplo (área de São Paulo).
  - `TerritoryRepository` (mock):
    - `subscribeTerritories` lê e assina apenas `territory-store`.
    - `saveTerritoryAndUpdateUserStats` é no-op (não persiste em nuvem).
  - `LeaderboardRepository` (mock):
    - Constrói `RankingEntry[]` a partir de `users` locais na store.

- **Amigos e troféus**:
  - Lógica depende majoritariamente dos dados locais.
  - Algumas features que precisariam de Firestore podem ficar limitadas ou apenas simuladas.

### 2.3 Limitações

- Não há persistência entre sessões além do que é salvo no `localStorage` (auth).
- Não há envio de e-mails reais (reset de senha).
- Não há dados compartilhados entre usuários diferentes (cada navegador tem seu próprio estado).

## 3. Modo produção (Firebase)

### 3.1 Objetivo

- Rodar o produto real com:
  - Auth segura via Firebase Authentication.
  - Perfis e territórios persistidos em Firestore.
  - Regras de segurança fortalecidas (`firestore.rules`).
  - Ranking e amigos funcionando globalmente.

### 3.2 Comportamento

- **Auth**:
  - Login/cadastro/reset usam Firebase Authentication.
  - `createUserProfileAfterSignup` garante que `users/{uid}` e `usernames/{slug}` sejam criados de forma transacional.
  - `ensureUserProfile` garante que qualquer login tenha um perfil coerente em `users`.

- **Dados de mapa e ranking**:
  - `use-firestore-territory-sync`:
    - Usa `TerritoryRepository` com implementação Firebase.
    - Escuta `territories` via `onSnapshot` e reflete na `territory-store`.
  - `saveTerritoryAndUpdateUserStats`:
    - Escreve `territories` e atualiza `users` em transação.
  - `use-global-leaderboard`:
    - Usa `LeaderboardRepository` com implementação Firebase.
    - Assina ranking ordenado por `totalAreaM2`.

- **Amigos e troféus**:
  - `friendRequests` em Firestore armazenam pedidos/amizades.
  - Troféus podem usar dados agregados reais (área, número de amigos, etc.).

### 3.3 Segurança

- Regras em `firestore.rules`:
  - Limitam quem pode ler/alterar perfis, territórios e requests de amizade.
  - Validam payloads (área, status, tamanho de `polygonJson`).
- Transações (`runTransaction`) são usadas para operações críticas (territórios + stats de usuário).

## 4. Resumo rápido

- **Quando desenvolver UI e domínio**:
  - Sempre considere que o código deve funcionar tanto em demo quanto em produção.
  - Use os repositórios (`getTerritoryRepository`, `getLeaderboardRepository`) em vez de falar direto com Firebase nos componentes/hooks.

- **Quando testar**:
  - Use modo demo para iterar mais rápido e compartilhar com stakeholders sem risco.
  - Use modo produção (com projeto Firebase de dev) para validar fluxos reais de auth, persistência e segurança.

