# SEC_AuthFlows

## A01:2021 Broken Access Control

| Achado | Severidade | Detalhe |
|--------|------------|---------|
| Rotas públicas acessíveis a todos | OK | Esperado |
| `(authenticated)` protegido por AuthGuard + Firebase session | OK | Dupla camada (UI + Auth state) |

**Risco:** AuthGuard só valida presença de `user` + `accessToken` na store — não verifica expiração em tempo real antes de cada navegação (Firebase SDK renova token em background). **MÉDIO** — utilizador com token revogado pode ter estado até refresh.

## A07:2021 Identification and Authentication Failures

- Firebase Auth gere passwords; reset por email.
- Google OAuth via popup — depende de domínios autorizados no Firebase Console.

Mitigação recomendada: Firebase App Check (não implementado no código analisado).

## APIs servidor (2026-05-09)

- `verifyIdToken(token, true)` nas rotas `/api/runs/complete`, `/api/territories/capture`, `/api/friends/lookup` — revogação ativa.
- **Login:** apenas **e-mail + senha** no formulário ([`loginSchema`](../../lib/auth/schemas.ts) `.email()`); [`login()`](../../lib/auth/auth-service.ts) **não** chama `POST /api/auth/resolve-identifier`. Username para convites/redes sociais usa-se na página **Amigos** (`lookupFriendUid`), não no login.
- A rota [`POST /api/auth/resolve-identifier`](../../app/api/auth/resolve-identifier/route.ts) permanece disponível para ferramentas futuras ou integrações; não faz parte do fluxo de login na UI actual.

## Senha e observabilidade (`login` / `loginWithGoogle`)

### Trim da senha (fallback)

- Primeira tentativa de `signInWithEmailAndPassword` usa a senha **tal como vem do formulário** (compatível com senhas que incluem espaços intencionais).
- Se falhar com `auth/invalid-credential`, `auth/wrong-password` ou `auth/user-not-found` **e** a senha difere de `password.trim()` **e** o trim não é vazio, faz-se **uma segunda tentativa** com `password.trim()` (cenários autofill / gestor de senhas / paste com espaços).
- Sucesso na 2ª tentativa gera log **`[WARN] [login] Login recuperado após trim da senha`** (JSON com `component`, `source`, `functionality`, `recovered_with`). **Não** regista email, senha nem tokens.

### Logs estruturados (sem dados sensíveis)

| Momento | Nível | Mensagem resumida | Contexto JSON |
|--------|-------|-------------------|----------------|
| Falha em `login` após erros Firebase | ERROR | `[login] Falha na autenticação` | `component: AuthService`, `source`, `functionality: login`, `code` (Firebase ou `unknown`) |
| Falha em `loginWithGoogle` | ERROR | `[loginWithGoogle] Falha no login social` | idem, `functionality: loginWithGoogle` |
| Recuperação por trim | WARN | `[login] Login recuperado após trim da senha` | `recovered_with: password_trim` |

### Mensagens ao utilizador vs código Firebase (`login`)

| Código Firebase (ex.) | Mensagem `AuthError` ao utilizador |
|-----------------------|-------------------------------------|
| `auth/invalid-credential`, `auth/wrong-password`, `auth/user-not-found` | E-mail ou senha incorretos. |
| `auth/too-many-requests` | Muitas tentativas. Tente mais tarde. |
| `auth/invalid-email` | E-mail inválido. |
| Outro / sem código | Não foi possível entrar. Tente novamente. |

Erros `AuthError` lançados antes do `signIn` são repropagados (ex.: validação Zod no formulário). Falhas Firebase no `signIn` seguem a matriz acima.
