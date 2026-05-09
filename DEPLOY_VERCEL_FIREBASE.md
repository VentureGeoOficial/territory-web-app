# Deploy do TerritoryRun Web na Vercel + Firebase

Guia operacional de ponta a ponta para colocar a aplicação em produção
usando Vercel para o hosting/serverless do Next.js e Firebase para Auth +
Firestore.

## 1. Pré-requisitos

- Conta na [Vercel](https://vercel.com) com permissão para criar projetos.
- Projeto na [Firebase Console](https://console.firebase.google.com) com:
  - **Authentication** ativado (provedor _Email/Password_; opcional
    _Google_).
  - **Cloud Firestore** ativado (modo Production ou Native).
  - Domínios autorizados em Authentication -> Settings -> _Authorized
    Domains_ incluindo o domínio Vercel (ex.: `seu-projeto.vercel.app`).

## 2. Variáveis de ambiente

A lista completa está em [Docs/Firebase/variaveis-ambiente.md](Docs/Firebase/variaveis-ambiente.md).
Resumo do mínimo viável:

| Variável | Tipo |
|----------|------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Cliente (público) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Cliente (público) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Cliente (público) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Cliente (público) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Servidor (segredo) |

## 3. Passo a passo

### 3.1 Obter as chaves do Firebase

1. Firebase Console -> _Configurações do projeto_ -> aba _Geral_.
2. Em "Seus apps", selecione o app web (ou crie um se ainda não existir).
3. Copie os valores do bloco `firebaseConfig` para as variáveis
   `NEXT_PUBLIC_FIREBASE_*` correspondentes.
4. Aba _Contas de Serviço_ -> _Gerar nova chave privada_. Guarde o JSON
   descarregado em local seguro — ele será o valor de
   `FIREBASE_SERVICE_ACCOUNT_JSON`.

### 3.2 Configurar na Vercel

1. _Project Settings_ -> _Environment Variables_.
2. Adicione cada variável da tabela acima.
   - Para `NEXT_PUBLIC_FIREBASE_*`: marque _Production_, _Preview_ e
     _Development_.
   - Para `FIREBASE_SERVICE_ACCOUNT_JSON`: cole o JSON inteiro
     (multilinha aceito) e marque os mesmos ambientes; **nunca prefixe com
     `NEXT_PUBLIC_`**.
3. _Deployments_ -> _Redeploy_ para o último commit.

### 3.3 Configurar Firestore

Os ficheiros de configuração já estão versionados:

- [`firestore.rules`](firestore.rules) — regras de segurança.
- [`firestore.indexes.json`](firestore.indexes.json) — índices compostos.

Faça deploy via Firebase CLI (uma vez por projeto):

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # selecionar o projectId
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Regras de Storage baseline (negam todo o acesso) em [`storage.rules`](storage.rules).

### Ordem de rollout coordenado (evitar downtime)

1. **Primeiro:** deploy na **Vercel** que já inclua as rotas API servidoras (`POST /api/runs/complete`, `POST /api/friends/lookup`, `POST /api/auth/resolve-identifier`). O cliente deixa de escrever `territories`, `runs` e agregados diretamente — sem estas rotas ativas, utilizadores não conseguem concluir corridas após publicar regras mais restritivas.
2. **Depois:** `firebase deploy --only firestore:rules,firestore:indexes,storage`.
3. Smoke tests: finalizar corrida sem overlap inimigo; conquista hostil (`/api/territories/capture`); pedido de amigo por email; login com username.

### 3.4 Verificar o deploy

Depois do redeploy concluído, abra o domínio Vercel e verifique:

| Cenário | Esperado |
|---------|----------|
| Abrir `/` | Landing renderiza sem erros no console |
| Abrir `/login` e tentar entrar | Sem alerta "Configure NEXT_PUBLIC_FIREBASE_*" |
| Cadastro `/cadastro` | Cria conta no Firebase Auth e documento em `users/{uid}` |
| Abrir `/mapa` autenticado | Carrega territórios; sem aviso de mapa em demo |
| Capturar território (POST `/api/territories/capture`) | Devolve `200` com `territoryId`; logs do Vercel sem erro de service account |
| Finalizar corrida normal (POST `/api/runs/complete`) | `200` com `territoryId` e `runId` quando não há overlap inimigo |
| Login por username | Resolve email via `POST /api/auth/resolve-identifier` (servidor) antes do `signInWithEmailAndPassword` |

### 3.5 Cloud Functions (opcional)

A pasta [`functions/`](functions/) contém Cloud Functions independentes
deste deploy Vercel. Se forem necessárias, faça deploy separado:

```bash
firebase deploy --only functions
```

## 4. Troubleshooting

| Sintoma | Causa provável | Ação |
|---------|----------------|------|
| `Firebase não configurado. Variáveis ausentes ou inválidas: apiKey, ...` | `NEXT_PUBLIC_*` em falta no build | Adicionar no painel Vercel + redeploy |
| `FIREBASE_SERVICE_ACCOUNT_JSON inválido (JSON malformado)` | JSON colado com aspas duplas escapadas indevidamente | Cole o JSON original sem alterar; ou compacte para uma linha mantendo `\n` na `private_key` |
| `FIREBASE_SERVICE_ACCOUNT_JSON inválido. Campos obrigatórios em falta: project_id, ...` | Conta de serviço errada / JSON truncado | Gerar nova chave no Firebase Console e substituir |
| `503 Servidor não configurado para captura` em `/api/territories/capture` | Variável de servidor ausente em Production | Adicionar `FIREBASE_SERVICE_ACCOUNT_JSON` (sem `NEXT_PUBLIC_`) e redeploy |
| Login falha com "domínio não autorizado" | Domínio Vercel não está em Firebase Auth -> Authorized Domains | Adicionar `seu-projeto.vercel.app` e domínios custom |
| Variável atualizada mas comportamento não muda | `NEXT_PUBLIC_*` é embebida no build | Disparar novo deploy (Deployments -> Redeploy) |

## 5. Pós-deploy

- Configure App Check (Firebase Console -> App Check) para mitigar abuso da
  API key pública.
- Monitorize os logs em _Vercel -> Project -> Logs_ e em _Firebase Console
  -> Functions / Firestore Usage_.
- Reveja periodicamente as Firestore Rules em [`firestore.rules`](firestore.rules)
  e os scopes da Service Account.

## 6. Referências

- [Docs/Firebase/arquitetura.md](Docs/Firebase/arquitetura.md)
- [Docs/Firebase/variaveis-ambiente.md](Docs/Firebase/variaveis-ambiente.md)
- [Docs/Seguranca/firebase-config/SEC_firebase-env.md](Docs/Seguranca/firebase-config/SEC_firebase-env.md)
