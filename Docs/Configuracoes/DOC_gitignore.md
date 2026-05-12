# DOC_gitignore.md

**Arquivos:** `.gitignore`, `.vercelignore`
**Data da última alteração:** 2026-05-11
**Responsável:** Refatoração de exclusões de versionamento e deploy
**Objetivo:** Reduzir o peso do repositório, evitar versionamento de artefatos de build/cache e diminuir o tamanho do pacote enviado à Vercel a cada deploy/branch criado pelo v0.

---

## 1. Contexto

Antes desta alteração, o repositório versionava artefatos que não deveriam estar sob controle de versão e o deploy enviava à Vercel uma série de arquivos desnecessários para runtime (documentação interna, testes, regras Firebase, Cloud Functions, etc.).

Sintoma relatado pelo usuário:
> "Sempre que cria uma branche ele sobe umas coisas padrão e fica muito pesado."

### 1.1 Diagnóstico

| Arquivo / Pasta | Antes | Depois | Justificativa |
|---|---|---|---|
| `tsconfig.tsbuildinfo` (350 KB) | Versionado | **Removido do tracking** + ignorado | Cache local do compilador TypeScript. Não deve estar no repositório. |
| `.next/` | Já ignorado | Mantido ignorado | Build local do Next.js. |
| `.env.local` | Já ignorado | Mantido ignorado | Contém segredos. **NUNCA versionar.** |
| `package-lock.json` (354 KB) | Versionado | **Removido do repositório** | Conflitava com `pnpm-lock.yaml`. Projeto agora usa pnpm exclusivamente. |
| `pnpm-lock.yaml` (260 KB) | Versionado | Mantido | É o lockfile efetivamente usado pela Vercel/v0. |
| `IMG/*.png` | Versionado | Mantido | Importadas em runtime em `components/brand/venture-geo-logo.tsx`. |

### 1.2 Conflito crítico identificado

Existem três lockfiles concorrentes no repositório:

- `package-lock.json` (raiz) — npm
- `pnpm-lock.yaml` (raiz) — pnpm
- `functions/package-lock.json` — npm (Firebase Functions, projeto separado)

A Vercel detecta automaticamente o gerenciador pelo lockfile e prioriza `pnpm-lock.yaml`. **Misturar lockfiles na raiz é fonte conhecida de builds instáveis e divergência de versões resolvidas.** Recomenda-se manter apenas um.

---

## 2. Estrutura do `.gitignore`

O `.gitignore` foi reorganizado em seções com comentários, cobrindo:

1. **v0 / Vercel internos** — `__v0_*`, `.v0-trash/`, `.snowflake/`, `.vercel/`, `next.user-config.*`
2. **Variáveis de ambiente** — `.env`, `.env.local`, `.env.*.local` (mantém `.env.example` versionado)
3. **Dependências** — `node_modules/`, `.pnpm-store/`, `.npm/`, `.yarn/`
4. **Builds e caches** — `.next/`, `out/`, `build/`, `dist/`, `.turbo/`, `.swc/`, `*.tsbuildinfo`
5. **Logs e debug** — `*.log`, `npm-debug.log*`, `pnpm-debug.log*`, etc.
6. **Testes / cobertura** — `coverage/`, `*.lcov`, `.nyc_output/`, `.vitest-cache/`
7. **Firebase** — `.firebase/`, `firebase-debug.log*`, `firestore-debug.log*`, `.runtimeconfig.json`, `functions/lib/`
8. **IDEs / editores** — `.idea/`, `.vscode/*` (com exceções para configs compartilhadas), `.history/`
9. **Sistema operacional** — `.DS_Store`, `Thumbs.db`, `Desktop.ini`, `$RECYCLE.BIN/`
10. **Temporários do projeto** — `.tmp_*`, `*.tmp`, `*.bak`, `*.orig`, `*.rej`
11. **Análise de bundle** — `.bundle-analyzer/`, `analyze/`

---

## 3. Estrutura do `.vercelignore`

O `.vercelignore` é específico da Vercel e **complementa** o `.gitignore`. Ele controla o que é enviado no upload do deploy, **mesmo que esteja versionado no Git**. Reduz o tamanho do pacote em cada build.

Itens excluídos do upload para Vercel:

- **Documentação** — `Docs/`, `DEPLOY_VERCEL_FIREBASE.md`, `FIREBASE_RULES.md`, `SECURITY_FIREBASE.md`
- **Testes** — `__tests__/`, `vitest.config.ts`, `coverage/`
- **Cloud Functions** — `functions/` (deployadas no Firebase, não na Vercel)
- **Regras Firebase** — `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `storage.rules`
- **CI** — `.github/`
- **Ambientes v0/Cursor** — `.cursor/`, `.v0-trash/`, `.snowflake/`
- **Caches** — `*.tsbuildinfo`, `.next/cache/`, `.turbo/`, `.swc/`
- **Logs e temporários**
- **Placeholders** — `index.html` (não usado pelo Next.js App Router)

> **Importante:** O `.vercelignore` **não substitui** o `.gitignore`. São arquivos com finalidades distintas. O `.gitignore` controla o que entra no histórico do Git; o `.vercelignore` controla o que é empacotado e enviado para o servidor da Vercel a cada deploy.

---

## 4. Ações executadas

| # | Ação | Comando | Status |
|---|---|---|---|
| 1 | Reescrita do `.gitignore` com cobertura completa | edição direta | OK |
| 2 | Criação do `.vercelignore` | criação | OK |
| 3 | Remoção de `tsconfig.tsbuildinfo` do tracking | `git rm --cached tsconfig.tsbuildinfo` | OK |
| 4 | Limpeza de arquivo temporário usado em diagnóstico | `Remove-Item .tmp_tracked_files.txt` | OK |
| 5 | Documentação desta mudança | criação deste arquivo | OK |

---

## 5. Itens pendentes (decisão do usuário)

### 5.1 Conflito de lockfiles — RESOLVIDO

Decisão aplicada: **pnpm como gerenciador oficial**.
- `package-lock.json` foi removido (`git rm`).
- `pnpm-lock.yaml` é o único lockfile da raiz.
- Adicionado o campo `"packageManager": "pnpm@9.15.4"` em `package.json` (habilita Corepack na Vercel e fixa a versão do pnpm que o ambiente deve usar — evita drift entre local, CI e produção).
- O `functions/package-lock.json` permanece (projeto separado de Firebase Functions).

**Para o desenvolvedor local (Windows):** instalar pnpm:
```powershell
npm install -g pnpm@9.15.4
# ou habilitar via Corepack (recomendado):
corepack enable
corepack prepare pnpm@9.15.4 --activate
```

### 5.2 Otimização de imagens (Média prioridade)

`IMG/logos-sem-fundo.png` e `IMG/mascote-sem-fundo.png` somam ~800 KB. Recomendado:
- Converter para WebP (redução típica de 60-80%)
- Mover para `public/` ou continuar em `IMG/` (já configurado como alias `@/IMG/`)
- Atualmente o Next.js está com `images.unoptimized: true` em `next.config.mjs`, o que impede a otimização automática.

### 5.3 Risco em `next.config.mjs` (Atenção)

`typescript.ignoreBuildErrors: true` esconde erros de tipo no build. Recomendado revisar e remover essa flag — erros de TypeScript não capturados em build podem chegar a produção.

---

## 6. Observabilidade (logs)

Esta operação foi de configuração (não introduz código executável), portanto não gera logs em runtime. As regras de observabilidade do projeto (`logger.ts`, padrão estruturado JSON) permanecem inalteradas. Não há novos pontos de log a registrar para esta mudança.

---

## 7. Análise de segurança (Security by Design)

| Verificação | Resultado | Severidade |
|---|---|---|
| Vazamento de segredos via `.env*` | `.env.local` permanece **fora** do controle de versão. `.env.example` versionado **não contém segredos**. | OK |
| Hardcoded secrets em `.gitignore` / `.vercelignore` | Nenhum. | OK |
| `tsconfig.tsbuildinfo` pode conter caminhos sensíveis? | Apenas caminhos relativos do projeto. Sem impacto de segurança. | BAIXO |
| Exposição de documentação interna no bundle de produção | `.vercelignore` agora **bloqueia** `Docs/`, `SECURITY_FIREBASE.md`, `FIREBASE_RULES.md`, etc. | Mitigado |
| Logs Firebase versionáveis (`firebase-debug.log`) podem conter dados sensíveis | Adicionados ao `.gitignore`. | Mitigado |

**Conclusão:** sem vulnerabilidades introduzidas. Mitigação adicional: documentação interna do projeto não vaza mais via deploy público da Vercel.

---

## 8. Verificação pós-aplicação

```powershell
# Confirmar que tsconfig.tsbuildinfo saiu do tracking
git ls-files --error-unmatch tsconfig.tsbuildinfo
# Deve falhar com "did not match any file(s) known to git" — comportamento esperado.

# Confirmar que .env.local continua ignorado
git check-ignore -v .env.local

# Confirmar tamanho do pacote enviado à Vercel após o próximo deploy:
# Vercel Dashboard → Project → Deployments → último deploy → "Building" → tamanho do build context
```
