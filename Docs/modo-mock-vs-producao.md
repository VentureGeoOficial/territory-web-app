# Firebase obrigatório vs repositório mock interno

> **Histórico:** versões anteriores deste documento descreviam um "modo demo"
> com login mock (`demo@territory.run` / `demo123`). Esse comportamento foi
> removido — o login hoje **exige** Firebase. O título e o conteúdo abaixo
> refletem o estado atual do código.

## 1. Como o estado é detetado

- Arquivo: [`lib/config/firebase-env.ts`](../lib/config/firebase-env.ts)
  (re-exportado por [`lib/firebase/config.ts`](../lib/firebase/config.ts) por
  compatibilidade).
- Função: `isFirebaseConfigured()` — retorna `true` quando as variáveis
  `NEXT_PUBLIC_FIREBASE_*` obrigatórias estão presentes (`API_KEY`,
  `AUTH_DOMAIN`, `PROJECT_ID`, `APP_ID`).

Pontos de uso:

- [`lib/auth/auth-service.ts`](../lib/auth/auth-service.ts) — bloqueia login,
  registo, reset de senha, troca/exclusão de conta sem Firebase.
- [`components/auth/login-form.tsx`](../components/auth/login-form.tsx) e
  [`components/auth/signup-form.tsx`](../components/auth/signup-form.tsx) —
  desativam os formulários e exibem aviso.
- [`lib/data/territory-repository.ts`](../lib/data/territory-repository.ts)
  — alterna entre implementação Firebase e repositório mock interno
  (Zustand) para territórios e ranking.

## 2. Sem Firebase configurado

- **Auth:** desativado. As páginas `/login`, `/cadastro`, `/esqueci-senha`
  mostram alerta "Configure NEXT_PUBLIC_FIREBASE_* nas variáveis de ambiente".
- **Rotas autenticadas (`/mapa`, `/competicao`, `/amigos`, `/trofeus`,
  `/conta`, `/seguranca`):** inacessíveis — `AuthGuard` redireciona para
  `/login`.
- **Rotas públicas (`/`, `/termos`, `/privacidade`, `/ajuda`):** funcionam
  normalmente.
- **Repositórios mock:** o código de `lib/data/territory-repository.ts`
  ainda contém implementações mock (Zustand + `initMockData()`). Elas estão
  preservadas para testes locais e para serem reaproveitadas se um modo
  demo público vier a ser reintroduzido, mas hoje não são acessíveis sem
  sessão autenticada.

## 3. Com Firebase configurado (estado normal de produção)

### 3.1 Auth

- Login/cadastro/reset usam Firebase Authentication.
- `createUserProfileAfterSignup` cria de forma transacional `users/{uid}` e
  `usernames/{slug}`.
- `ensureUserProfile` garante que qualquer login tenha perfil coerente em
  `users`.

### 3.2 Dados de mapa e ranking

- `use-firestore-territory-sync` usa `TerritoryRepository` Firebase: assina
  `territories` via `onSnapshot` e reflete na `territory-store`.
- Captura de território passa pelo endpoint
  [`POST /api/territories/capture`](../app/api/territories/capture/route.ts)
  que valida o Id Token e executa transação no Admin SDK.
- `use-global-leaderboard` assina ranking ordenado por `totalAreaM2`.

### 3.3 Amigos e troféus

- `friendRequests` em Firestore para pedidos/amizades.
- Troféus consomem dados agregados reais (área, número de amigos, etc.).

### 3.4 Segurança

- Regras em [`firestore.rules`](../firestore.rules) controlam leitura/escrita
  por usuário.
- Transações (`runTransaction`) para operações críticas que afetam vários
  documentos (territórios + stats).

## 4. Resumo rápido

- **Desenvolvimento:** preencha [`.env.local`](../.env.example) com um
  projeto Firebase (de dev) e tudo funciona como produção.
- **Vercel:** ver [`DEPLOY_VERCEL_FIREBASE.md`](../DEPLOY_VERCEL_FIREBASE.md).
- **Sem Firebase:** apenas as páginas públicas funcionam. Não existe mais
  login mock para área autenticada.
