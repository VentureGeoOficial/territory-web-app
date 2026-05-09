# SEC_firebase-env.md — Análise de segurança da camada de configuração Firebase

## Descrição

A refatoração centralizou a leitura das variáveis de ambiente do Firebase em
[`lib/config/firebase-env.ts`](../../../lib/config/firebase-env.ts) (cliente)
e [`lib/config/firebase-admin-env.ts`](../../../lib/config/firebase-admin-env.ts)
(servidor). Esta análise documenta riscos identificados, classificações e as
correções aplicadas.

**Data da análise:** 2026-05-09
**Escopo:** `lib/config/*`, `lib/firebase/*`, `app/api/territories/capture/route.ts`,
componentes de auth e mapa.

## Variáveis e classificação

| Variável | Tipo | Sensibilidade | Onde usar |
|----------|------|---------------|-----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Cliente | Pública (não é segredo) | Bundle do browser |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Cliente | Pública | Bundle do browser |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Cliente | Pública | Bundle do browser |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Cliente | Pública | Bundle do browser |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Servidor | **CRÍTICA** (acesso admin total ao projeto) | Apenas runtime serverless |

> A "API Key" do Firebase Web não é equivalente a uma chave secreta de API
> tradicional — é um identificador público. A segurança do projeto vem de:
> Firestore Security Rules, App Check, restrições de domínio em Auth, e
> validação de tokens no backend (`verifyIdToken`).

## Vulnerabilidades verificadas (OWASP Top 10 + boas práticas)

### V1 — Hardcoded secrets

- **Verificação:** grep por padrões `AIza...`, `service_account`, `private_key`
  no repositório.
- **Resultado:** sem ocorrências em código. Toda credencial é lida via
  `process.env`.
- **Severidade:** N/A (nenhuma encontrada).

### V2 — Exposição de credenciais privadas no bundle

- **Risco:** se `FIREBASE_SERVICE_ACCOUNT_JSON` fosse importado direta ou
  indiretamente por um Client Component, o webpack inseri-lo-ia no bundle
  enviado ao browser, expondo acesso administrativo total ao projeto.
- **Severidade:** CRÍTICO (caso ocorresse).
- **Correção aplicada:** [`lib/config/firebase-admin-env.ts`](../../../lib/config/firebase-admin-env.ts)
  declara `import 'server-only'` no topo. Qualquer importação a partir de
  código de cliente faz o build falhar com erro explícito.

### V3 — Validação de entrada das variáveis

- **Risco anterior:** valores ausentes resultavam em strings vazias passadas
  ao SDK Firebase, gerando falhas obscuras (e.g. `Firebase: Error (auth/invalid-api-key)`).
- **Severidade:** MÉDIO (impacto: dificuldade de debug, sem vazamento).
- **Correção aplicada:** validação Zod em ambas as camadas. `assertFirebasePublicConfig()`
  e `getFirebaseAdminCredential()` lançam erros nomeando os campos em falta.

### V4 — Vazamento via logs

- **Verificação:** o código atual usa `console.error(e)` em
  [`app/api/territories/capture/route.ts`](../../../app/api/territories/capture/route.ts).
- **Risco:** mensagens de erro do Admin SDK podem conter trechos da
  `private_key` em casos extremos.
- **Severidade:** BAIXO (mensagens padrão do `firebase-admin` não imprimem a
  chave; mas é uma boa prática mascarar).
- **Correção aplicada:** o parser em `firebase-admin-env.ts` produz
  mensagens próprias que **não incluem** o conteúdo da `private_key` —
  apenas o nome do campo. Para `JSON.parse` falhas, o erro original do
  parser do JS é incluído (não contém a `private_key` quando o JSON é
  inválido por sintaxe).
- **Recomendação futura:** introduzir um helper `logger` que mascare
  automaticamente segredos por nome de campo, conforme a regra de logs do
  projeto. Não bloqueante.

### V5 — Persistência de tokens no cliente

- **Estado atual:** `lib/store/auth-store.ts` persiste `accessToken`
  (Firebase Id Token) em `localStorage` (`territoryrun-auth`).
- **Risco:** XSS poderia ler o token. Tokens Firebase têm TTL curto (1h) e
  são rotacionados pelo SDK, mas a janela existe.
- **Severidade:** MÉDIO. Mitigação parcial: tokens curtos + Firestore Rules
  baseadas em `request.auth.uid`.
- **Status:** **fora do âmbito** desta refatoração; documentado para
  consideração futura. Migrar para cookie HttpOnly Same-Site=Lax exigiria
  uma camada de sessão server-side (e.g. `cookies()` + `verifySessionCookie`
  do Admin SDK).

### V6 — Autenticação na API

- **Verificação:** `app/api/territories/capture/route.ts` exige header
  `Authorization: Bearer <idToken>` e valida com `verifyIdToken`.
- **Severidade:** OK.
- **Correção aplicada:** nenhuma necessária; comportamento já adequado.

### V7 — Autorização (Firestore Rules)

- Verificação: as regras em [`firestore.rules`](../../../firestore.rules)
  devem garantir que `request.auth.uid == resource.data.userId` (ou
  equivalente) para escrita. Análise específica das rules está fora do
  âmbito desta tarefa, mas vale uma revisão dedicada.
- **Severidade:** N/A para esta refatoração.

### V8 — SQL Injection / Injeção em geral

- N/A. Firestore não usa SQL; entradas do API endpoint passam por validação
  Zod (`bodySchema`).

### V9 — XSS

- N/A para a camada de configuração. Conteúdo renderizado via React (escape
  automático). Componentes de auth/mapa não foram alterados em lógica.

## Resumo das correções aplicadas

1. Adicionado `'server-only'` em `lib/config/firebase-admin-env.ts` —
   correção CRÍTICA preventiva de exposição da Service Account.
2. Validação Zod com mensagens explícitas em ambos os ficheiros de
   configuração — correção MÉDIA da experiência de debug e robustez.
3. Mensagens de erro deixaram de mencionar `.env.local` — alinhamento de
   comunicação para fluxo real (Vercel).
4. Documentação criada em [`Docs/Firebase/`](../../Firebase/),
   [`DEPLOY_VERCEL_FIREBASE.md`](../../../DEPLOY_VERCEL_FIREBASE.md) e este
   ficheiro — visibilidade operacional.

## Itens em aberto (para próximas iterações)

- **MÉDIO:** Migrar persistência de Id Token para cookie HttpOnly Same-Site
  (eliminar leitura por XSS).
- **BAIXO:** Helper `logger` central com mascaramento por campo
  (`maskSecrets`) — alinhar à regra interna de observabilidade.
- **BAIXO:** Ativar Firebase App Check em produção e documentar passos.
- **MÉDIO:** Reativar `typescript: { ignoreBuildErrors: false }` em
  [`next.config.mjs`](../../../next.config.mjs) — atualmente erros TS são
  silenciados no build.
