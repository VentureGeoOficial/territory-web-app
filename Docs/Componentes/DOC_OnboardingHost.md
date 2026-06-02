# DOC_OnboardingHost

**Ficheiros:**
- [`components/onboarding/onboarding-host.tsx`](../../components/onboarding/onboarding-host.tsx)
- [`components/onboarding/onboarding-overlay.tsx`](../../components/onboarding/onboarding-overlay.tsx)
- [`lib/onboarding/onboarding-steps.ts`](../../lib/onboarding/onboarding-steps.ts)
- [`lib/onboarding/onboarding-storage.ts`](../../lib/onboarding/onboarding-storage.ts)
- [`lib/onboarding/onboarding-completion.ts`](../../lib/onboarding/onboarding-completion.ts)

## Objetivo

Tutorial de primeiro acesso em 9 passos (mapa, corrida, navegação, conclusão). Exibido uma vez por utilizador.

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
- `run-cta` / `#tour-run-cta` — controlos de corrida
- `nav-dashboard`, `nav-competicao`, `nav-amigos`, `nav-loja`, `nav-conta`, `nav-trofeus` — Header / bottom nav
