# SEC_onboarding-host.md

**Data da análise:** 2026-06-02  
**Componente:** OnboardingHost / OnboardingOverlay

## Resumo

| Item | Classificação |
|------|----------------|
| Persistência `hasCompletedOnboarding` em `users/{uid}` | BAIXO — campo opcional, só o dono escreve (rules existentes) |
| localStorage de conclusão | BAIXO — apenas flag UX; Firestore é fonte de verdade cross-device |
| Overlay bloqueia interação | BAIXO — intencional; botão Pular disponível |
| Logs | BAIXO — sem tokens/email; uid mascarado |

## Trecho relevante

Persistência em `lib/onboarding/onboarding-completion.ts` → `markOnboardingCompleted(uid)`.

## Risco

Utilizador poderia marcar tutorial como concluído via DevTools no `localStorage`; impacto limitado a UX (não afeta autorização nem dados sensíveis). Firestore sincroniza estado real no próximo login se cache for limpo.

## Correção aplicada

- Não registar PII nos eventos de log.
- Reutilizar regras Firestore de update do próprio `users/{uid}` (stats inalterados).
- `AppRatingHost` adia prompt até onboarding concluído (evita phishing de overlay empilhado).

## Recomendação futura

Reexibir tutorial via API autenticada se a opção “Ver tutorial” for exposta nas definições.
