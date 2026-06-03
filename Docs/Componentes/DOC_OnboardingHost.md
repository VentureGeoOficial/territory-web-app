# DOC_OnboardingHost

**Ficheiros:**
- [`components/onboarding/onboarding-host.tsx`](../../components/onboarding/onboarding-host.tsx)
- [`components/onboarding/onboarding-overlay.tsx`](../../components/onboarding/onboarding-overlay.tsx)
- [`lib/onboarding/onboarding-steps.ts`](../../lib/onboarding/onboarding-steps.ts)
- [`lib/onboarding/onboarding-storage.ts`](../../lib/onboarding/onboarding-storage.ts)
- [`lib/onboarding/onboarding-completion.ts`](../../lib/onboarding/onboarding-completion.ts)

## Objetivo

Tutorial de primeiro acesso em **8 passos**. Exibido uma vez por utilizador.

## Fluxo dos passos

1. Mapa (`/mapa`) — mapa + menção ao botão Iniciar corrida  
2. Dashboard (`/dashboard`)  
3. Competição (`/competicao`)  
4. Amigos (`/amigos`)  
5. Loja (`/loja`)  
6. Perfil / Conta (`/conta`)  
7. Troféus (`/mapa`, ícone do utilizador no Header)  
8. Finalização (modal centrado, botão «Começar»)

Navegação entre passos: apenas `goToStep` + `router.push`; **não** reiniciar `stepIndex` em mudanças de rota.

## Correção: reset ao avançar (2026-06)

**Causa:** o effect de inicialização dependia de `pathname` e chamava `setStepIndex(0)` + `router.push('/mapa')` em cada mudança de rota.

**Correção:** `hasInitializedRef` — inicialização única quando `eligible` passa a `true`; `pathname` removido das deps do effect de elegibilidade e de inicialização.

## Persistência (híbrida)

| Camada | Campo/chave |
|--------|-------------|
| Firestore `users/{uid}` | `hasCompletedOnboarding`, `onboardingCompletedAt` |
| localStorage | `territoryrun_onboarding_completed` = `1` |

Função: `markOnboardingCompleted(uid)` em [`lib/firebase/user-profile.ts`](../../lib/firebase/user-profile.ts).

Futuro: `resetOnboardingCache()` para “Ver tutorial novamente” nas definições (sem UI nesta entrega).

## Logs (nível INFO / WARNING / ERROR)

| Evento | Nível | Origem |
|--------|-------|--------|
| `shown` | INFO | Tutorial exibido |
| `step` | INFO | Mudança de passo (`stepId`, `stepIndex`) |
| `skipped` | INFO | Utilizador pulou |
| `onboarding_completed` | INFO | Persistência OK |
| `persist_failed` | ERROR | Falha ao gravar Firestore |
| `profile_fetch_failed` | WARNING | Não foi possível ler perfil |

Sem PII nos logs (uid mascarado via `lib/logging/logger.ts`).

## Integração

Montado em [`app/(authenticated)/layout.tsx`](../../app/(authenticated)/layout.tsx) após `ProfileCompleteGuard`, antes de `AppRatingHost`.

`AppRatingHost` só fica elegível quando `hasCompletedOnboarding` ou cache local indicam conclusão.

## Âncoras `data-tour`

- `map-area` — `MapWrapper`
- `nav-dashboard`, `nav-competicao`, `nav-amigos`, `nav-loja`, `nav-conta`, `nav-trofeus` — Header / bottom nav
