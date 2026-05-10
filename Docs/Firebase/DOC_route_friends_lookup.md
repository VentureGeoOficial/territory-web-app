# Observabilidade — `app/api/friends/lookup/route.ts`

## Logs

| Nível | Momento | Mensagem |
|-------|---------|----------|
| INFO | Lookup por e-mail sem doc em `users`, resolvido via Auth Admin (`getUserByEmail`) | `[api/friends/lookup]` JSON com `component: FriendsLookup`, `lookup_source: auth_fallback`, `callerUidPrefix` (8 chars, sem dados sensíveis) |
| INFO | Lookup por username: `usernames/{slug}` em falta; resolvido via `users.where('username','==',slug)` | `[api/friends/lookup]` JSON `lookup_source: users_username_fallback`, `callerUidPrefix` |
| ERROR | Exceção não tratada | `[api/friends/lookup]` |
| WARN | *(cliente)* | `[lookupFriendUid] API error` em `lib/firebase/friends.ts` quando `!res.ok` |

Logs INFO no cliente para pedidos / aceitação — ver [DOC_FriendsService.md](../Services/DOC_FriendsService.md).

## Objetivo

Detectar falhas Admin SDK ou pedidos malformados sem gravar emails ou UIDs alvo.

## Destino

Stdout / consola browser (warn cliente); servidor Vercel (INFO API).
