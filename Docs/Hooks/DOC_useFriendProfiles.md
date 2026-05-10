# DOC_useFriendProfiles

**Ficheiro:** [`hooks/use-friend-profiles.ts`](../../hooks/use-friend-profiles.ts)

## Assinatura

`useFriendProfiles(uids: string[])` → `Map<string, PublicProfileSnapshotData>`

## Comportamento

- Para cada UID único, subscreve [`subscribePublicProfile`](../../lib/firebase/user-profile.ts).
- Se o documento `publicProfiles/{uid}` não existir, mantém entrada com objeto vazio `{}` para não bloquear o estado de carregamento indefinidamente.
- Dados sensíveis: não aplicável — apenas campos públicos.

## Utilização

Página [`/amigos`](../../app/(authenticated)/amigos/page.tsx): nomes, `@username`, cores e avatares em pedidos e lista de amigos.
