# Regressão crítica — última atualização (username / ProfileCompleteGuard)

**Data:** 2026-05-30  
**Commit introduzidor:** `5cdbc6a` — *feat: implement username management and enhance user profile handling*

---

## 1. Diagnóstico completo

Após a última atualização, quatro sintomas reportados têm **a mesma causa raiz principal**:

| Problema | Sintoma | Causa raiz |
|----------|---------|------------|
| 1 | Tela amigos “travada” | `ProfileCompleteGuard` com spinner `h-screen` bloqueava **toda** a árvore autenticada durante verificação/redirecionamento |
| 2 | Bottom nav desapareceu | `MobileBottomNav` é filho das páginas; o guard substituía `{children}` por spinner fullscreen |
| 3 | Nome não aparece | Header usa `territory-store`; com UI bloqueada, sync do mapa não corre → `currentUser` vazio → fallback `"Demo"` |
| 4 | Peso/altura “não gravados” | Cadastro completo grava em `users` + `usersPrivate`; contas enviadas só a `/completar-perfil` recebem **apenas** username via `claimUsernameSlug` |

---

## 2. Arquivos alterados na última atualização (relevantes)

| Arquivo | Alteração |
|---------|-----------|
| [`app/(authenticated)/layout.tsx`](../app/(authenticated)/layout.tsx) | Adicionou `ProfileCompleteGuard` |
| [`components/auth/profile-complete-guard.tsx`](../components/auth/profile-complete-guard.tsx) | **Novo** — spinner bloqueante |
| [`app/(authenticated)/completar-perfil/page.tsx`](../app/(authenticated)/completar-perfil/page.tsx) | **Novo** |
| [`firestore.rules`](../firestore.rules) | `usernameUnchangedOrFirstSet()` |
| [`lib/firebase/friends.ts`](../lib/firebase/friends.ts) | Lookup via API |
| [`components/auth/login-form.tsx`](../components/auth/login-form.tsx) | Remove Google |
| [`lib/auth/auth-service.ts`](../lib/auth/auth-service.ts) | Rollback signup CRITICAL log |

**Não causaram regressão de navegação:** lookup API, remoção Google, aceite amigos (`/api/friends/accept`).

---

## 3. Causa raiz (código)

Versão problemática do guard:

```tsx
if (profile && !username) {
  router.replace('/completar-perfil')
  return  // ← setReady(true) NUNCA chamado
}
if (!ready) return <Spinner className="h-screen" />  // ← oculta bottom nav + páginas
```

Efeitos:

1. Utilizador sem username → redirecionamento com `ready === false` → spinner até pathname mudar.
2. Qualquer navegação reexecutava o efeito → flashes de spinner / sensação de “travamento”.
3. Filhos (`MobileBottomNav`, conteúdo) **não renderizavam** enquanto `!ready`.

---

## 4. Correção aplicada (mínima)

**Ficheiro:** [`components/auth/profile-complete-guard.tsx`](../components/auth/profile-complete-guard.tsx)

- Removido estado `ready` e spinner fullscreen.
- Guard faz **apenas** redirecionamento assíncrono para `/completar-perfil`.
- `{children}` renderizam **sempre** → bottom nav e navegação restaurados.

**Não removido:** página `/completar-perfil`, lookup API, regras username, cadastro transacional.

---

## 5. Problema 4 — persistência nome/peso/altura

| Fluxo | O que grava |
|-------|-------------|
| `/cadastro` completo | `createUserProfileAfterSignup` → `users`, `usersPrivate`, `publicProfiles`, `usernames` |
| `/completar-perfil` | `claimUsernameSlug` → **só** username + `usernames` |

Se utilizador nunca completou `/cadastro` (conta mínima via `ensureUserProfile`), peso/altura **não existem** até editar em `/conta`.

**Acção:** criar conta nova via `/cadastro` (não só Google/completar-perfil) e confirmar docs no Console.

---

## 6. Testes obrigatórios

| # | Teste | Esperado pós-fix |
|---|-------|------------------|
| 1 | Cadastro novo | `users.username`, `peso`, `altura`, `usernames/{slug}` |
| 2 | Entrar `/amigos` | Carrega sem spinner infinito |
| 3 | Sair `/amigos` | Navegação normal |
| 4 | Bottom nav | Visível em `/amigos`, `/mapa`, etc. |
| 5 | Perfil `/conta` | Nome, peso, altura carregam de `getUserProfile` |
| 6 | Logout/login | Dados persistem |

---

## 7. Rollback (se necessário)

Revert mínimo:

```bash
git checkout HEAD~1 -- components/auth/profile-complete-guard.tsx
```

Ou remover `ProfileCompleteGuard` de [`app/(authenticated)/layout.tsx`](../app/(authenticated)/layout.tsx).

---

## 8. Garantia de escopo

- **Alterado:** apenas `profile-complete-guard.tsx` (regressão).
- **Não alterado:** mapa, territórios, XP, ranking, loja, captura, amizades API.

---

## 9. Ops Firebase

Publicar `firestore.rules` se ainda não publicado (regra `usernameUnchangedOrFirstSet` para `/completar-perfil`).
