# SEC_ranking.ts

**Ficheiro analisado:** [`lib/firebase/ranking.ts`](../../../lib/firebase/ranking.ts)  
**Data da análise:** 2026-05-20

## Alteração

Ranking global passou de `orderBy('totalAreaM2')` para `orderBy('xp')` em `publicProfiles`. Apenas leitura pública; sem novos endpoints.

## Vulnerabilidades

Nenhuma **CRÍTICA** ou **ALTA** introduzida por esta mudança.

| Item | Nível | Descrição | Mitigação existente |
|------|-------|-----------|---------------------|
| Forja de XP pelo cliente | — | Não aplicável | `firestore.rules`: `publicProfiles` update não permite alterar `xp` |
| Exposição de XP de terceiros | BAIXO | XP é dado de jogo público, como área antes | Leitura `allow read: if true` já existente; sem PII extra |
| Enumeração de top jogadores | BAIXO | `limit(50)` igual ao anterior | Mantido |
| Log com dados sensíveis | BAIXO | UIDs mascarados em `logger.ts` | `sanitize()` no logger |

## Trecho relevante (rules)

`publicProfiles` update exige `xp` inalterado no cliente — escritas de XP só via transações servidor/API de captura.

## Correção aplicada

Nenhuma correção de segurança necessária além da mudança de métrica de ordenação (produto).

## Reversão

Reverter `orderBy` para `totalAreaM2` restaura o comportamento anterior sem impacto em rules.
