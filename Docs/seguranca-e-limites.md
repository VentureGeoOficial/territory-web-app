# Segurança, Rate Limiting e Limites do Sistema

Este documento resume as proteções atuais do TerritoryRun Web e onde elas são aplicadas:
- validações no frontend (Zod, hooks),
- rate limiting no cliente,
- regras `firestore.rules`,
- validações no backend (transações),
- limites e riscos conhecidos.

## 1. Autenticação e perfis

### 1.1 Frontend

- **Validação de cadastro** (`lib/auth/schemas.ts` + `Docs/cadastro-usuario.md`):
  - Usa Zod para garantir:
    - Email válido.
    - Senha com tamanho mínimo.
    - Username em regex estrita (apenas `a-z0-9_`, comprimento mínimo/máximo).
    - Idade mínima (13 anos).
    - Faixas razoáveis para peso/altura.
  - O formulário de cadastro (`components/auth/signup-form.tsx`) exibe mensagens amigáveis de erro.

- **Sessão**:
  - `auth-store` persiste apenas o necessário (usuário + tokens) em `localStorage`.
  - `selectIsAuthenticated` facilita guards de rotas.

### 1.2 Firestore Rules (perfil)

- `match /users/{userId}`:
  - `allow read: if true;` — leitura pública (para ranking, amigos).
  - `allow create, update: if request.auth.uid == userId;` — apenas o usuário pode escrever no próprio perfil.
  - `allow delete: if false;` — perfis não são deletáveis via cliente.

- `match /usernames/{slug}`:
  - `allow read: if true;`.
  - `allow create` apenas se:
    - `request.auth != null`.
    - `request.resource.data.uid == request.auth.uid`.
    - O doc ainda não existir (`!exists(/databases/$(database)/documents/usernames/$(slug))`).
  - `allow update, delete: if false;` — usernames são imutáveis pelo cliente.

## 2. Territórios e antifraude básico

### 2.1 Regras de negócio (domínio)

Ver `Docs/regras-territorio.md`:
- `createTerritoryFromDrawing`:
  - Exige pelo menos 3 pontos.
  - Calcula polígono bufferizado via Turf.
  - Aplica **geofence Suzano** (centro precisa estar dentro da bounding box).
  - Marca disputas com base em interseção de polígonos.

Essas regras protegem parcialmente contra:
- Territórios “nonsense” fora da área de interesse.
- Sobreposição acidental não tratada (sempre vira disputa).

### 2.2 Firestore Rules (territories)

- `match /territories/{territoryId}`:
  - Leitura pública (`allow read: if true;`) — mapa global visível.
  - Função `isValidTerritoryPayload()` garante:
    - `data.userId == request.auth.uid` (owner consistente).
    - `data.areaM2` é número, > 0 e ≤ 10.000.000 (≈ 10 km²).
    - `data.status` está entre `['active', 'disputed', 'protected', 'expired']`.
    - `data.polygonJson` é string e `polygonJson.size() <= 200000`.
  - `allow create`:
    - `request.auth != null && isValidTerritoryPayload()`.
  - `allow update, delete`:
    - `request.auth != null && resource.data.userId == request.auth.uid && isValidTerritoryPayload()`.

Resultado:
- Impede que um cliente grave áreas absurdas ou payloads gigantes.
- Garante que apenas o dono de um território possa alterá-lo/removê-lo.

### 2.3 Backend (transações)

- `saveTerritoryAndUpdateUserStats` (em `lib/firebase/territories.ts`):
  - Verifica geofence Suzano novamente (`isPositionInsideBox`).
  - Em transação:
    - Lê `users/{uid}`.
    - Calcula novos `totalAreaM2`, `territoriesCount`, `xp`.
    - Escreve `territories/{id}` e atualiza `users/{uid}` atomica e coerentemente.

Protege contra:
- Inconsistências de agregados (área, contagem, XP) em caso de falhas parciais.
- Escritas diretas em `users` sem passar pela lógica de XP (desde que os clientes usem essa função como única via).

## 3. Rate limiting e UX contra abuso

### 3.1 Hook `useRateLimit` (`hooks/use-rate-limit.ts`)

- Abstrai rate limiting no frontend para ações sensíveis:
  - `minInterval` — tempo mínimo entre execuções (ms).
  - `maxAttempts` — tentativas máximas por janela.
  - `windowMs` — janela de tempo (ms).
- API:
  - `canExecute()`, `recordExecution()`.
  - `isLimited`, `timeRemaining`, `attemptsRemaining`.
  - `withRateLimit(fn)` — wrapper que só executa `fn` se não estiver limitado.

### 3.2 Onde é usado

- Cadastro (`components/auth/signup-form.tsx`):
  - Tempo mínimo maior, menos tentativas por minuto.
- Login (`components/auth/login-form.tsx`):
  - Tempo mínimo moderado, algumas tentativas.
- Pedidos de amizade (`app/(authenticated)/amigos/page.tsx`):
  - Evita spam de requests.

### 3.3 Hooks auxiliares

- `useDebounce` — para inputs que fazem buscas/validações assíncronas.
- `useThrottle` — para ações que não devem ser executadas em alta frequência (scroll, resize, etc.).

## 4. Modo demo vs produção

### 4.1 Modo demo (mock)

- Ativado quando **não** há `NEXT_PUBLIC_FIREBASE_*` configuradas.
- Características:
  - Login apenas com usuário demo (`demo@territory.run` / `demo123`).
  - Dados de mapas, ranking, amigos são mockados via `territory-store.initMockData`.
  - `TerritoryRepository` e `LeaderboardRepository` usam somente Zustand como fonte:
    - Não há escrita em Firestore.
    - Não há e-mails de reset nem cadastro real.
- Segurança:
  - É um ambiente de demonstração; não há risco de corromper dados reais.

### 4.2 Modo produção (Firebase)

- Ativado por configuração de variáveis de ambiente Firebase.
- Todas as APIs de `lib/firebase/*` são usadas:
  - Auth real.
  - Perfis e territórios em Firestore.
  - Regras de segurança em `firestore.rules` se aplicam a todas as operações.

## 5. Riscos e próximos passos recomendados

- **Riscos atuais**:
  - Leitura pública de `users` e `territories` expõe stats e, potencialmente, email (dependendo de quais campos são gravados).
  - Regras de domínio ainda estão principalmente no cliente (domínio + transações); idealmente, parte disso poderia migrar para Cloud Functions para que mesmo clientes alternativos não burlem regras de negócio.
  - Rate limiting é apenas no frontend; um atacante com script pode contornar isso se não houver proteção no backend.

- **Melhorias sugeridas**:
  - Introduzir Cloud Functions para:
    - Criação de território a partir de rota/pontos enviados, com regras de negócio rodando no backend.
    - Rate limiting server-side para cadastros e pedidos de amizade.
  - Dividir `users` em:
    - Perfil público (nome, cor, stats de jogo).
    - Subcoleção privada (email, dados sensíveis).
  - Auditar logs de tentativa de abuso:
    - Coleção `territoryAbuseLogs` para gravações inválidas (área muito grande, fora da geofence, etc.).

## 6. Resumo rápido para desenvolvedores

- **Onde ajustar regras de segurança de leitura/escrita?**
  - `firestore.rules`.
- **Onde mudar limites de tamanho/área de território?**
  - `firestore.rules` (`isValidTerritoryPayload`) e `lib/firebase/territories.ts`.
- **Onde ajustar rate limiting de front?**
  - `hooks/use-rate-limit.ts` e seus usos nos formulários/páginas.
- **Onde mudar comportamento demo vs produção?**
  - `lib/firebase/config.ts` (detecção de configuração).
  - `lib/data/territory-repository.ts` (escolha de repositório).

