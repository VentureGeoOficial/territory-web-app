# SEC_firestore_username_created_at

## Contexto

Regra `usernames/*` (`firestore.rules`) exige `createdAt is timestamp || is int`.

## Achado histórico (MÉDIO)

Placeholder `serverTimestamp()` na avaliação de security rules poderia falhar o tipo esperado durante a transição de signup, causando `permission-denied` sem mensagem clara ao utilizador.

## Correção

- Persistência [`createUserProfileAfterSignup`](../../../lib/firebase/user-profile.ts): `usernames/{slug}.createdAt` passa a `Date.now()` (inteiro alinhado às rules).

## Data da análise

2026-05-10
