# DOC_FirestoreListeners

Mapa dos listeners Firestore (`onSnapshot`) no cliente e impacto estimado em reads/sincronização.

## Listeners por ficheiro e página

| Listener | Ficheiro | Página / hook | Notas de custo |
|----------|----------|-----------------|----------------|
| Coleção `territories` filtrada por faixa `centerLat` + filtro lng no cliente | [`lib/firebase/territories.ts`](../../lib/firebase/territories.ts) | [`hooks/use-firestore-territory-sync.ts`](../../hooks/use-firestore-territory-sync.ts) — Mapa | Viewport vem de [`mapViewportBounds`](../../lib/store/territory-store.ts), actualizado com debounce em [`MapEventHandler`](../../components/map/territory-map.tsx). Reduz reads vs coleção inteira; territórios com centro fora da faixa de latitude não aparecem até pan/zoom (trade-off MVP). |
| `publicProfiles` top N por área | [`lib/firebase/ranking.ts`](../../lib/firebase/ranking.ts) | Competição, preview home | ~N docs no snapshot inicial. |
| `publicProfiles/{uid}` utilizador actual | [`lib/firebase/user-profile.ts`](../../lib/firebase/user-profile.ts) | [`use-public-profile-sync`](../../hooks/use-public-profile-sync.ts) — Mapa | 1 doc. |
| `friendRequests` ×2 + ×2 | [`lib/firebase/friends.ts`](../../lib/firebase/friends.ts) | Amigos + [`use-friend-ids`](../../hooks/use-friend-ids.ts) | Duas queries por `subscribeAcceptedFriends` e duas por `subscribeFriendRequests` na página Amigos. |
| `publicProfiles` por amigo/pedido | [`hooks/use-friend-profiles.ts`](../../hooks/use-friend-profiles.ts) | Amigos | Um listener por UID na lista derivada. |

## HTTP Next.js relacionado (não Firestore)

Ver auditoria no plano de volume: `resolve-identifier` não é chamado pelo login após alinhar e-mail apenas; `friends/lookup`, `runs/complete`, `territories/capture` sob demanda.
