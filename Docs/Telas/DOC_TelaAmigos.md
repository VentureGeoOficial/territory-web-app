# DOC_TelaAmigos

**Rota:** `/amigos`  
**Ficheiro:** [`app/(authenticated)/amigos/page.tsx`](../../app/(authenticated)/amigos/page.tsx)

Fluxo pedidos de amizade: envio por email (`lookupFriendUid` / API Admin), listagem incoming/outgoing, aceitar/rejeitar/cancelar envio. Amigos listados via `getPublicProfileSummary` (`publicProfiles`). Depende de Firebase configurado — card aviso se não.
