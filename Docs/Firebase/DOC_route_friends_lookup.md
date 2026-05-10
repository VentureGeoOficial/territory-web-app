# Observabilidade — `app/api/friends/lookup/route.ts`

## Logs

| Nível | Momento | Mensagem |
|-------|---------|----------|
| INFO | Lookup por e-mail sem doc em `users`, resolvido via Auth Admin (`getUserByEmail`) | `[api/friends/lookup]` JSON com `component: FriendsLookup`, `lookup_source: auth_fallback`, `callerUidPrefix` (8 chars, sem dados sensíveis) |
| ERROR | Exceção não tratada | `[api/friends/lookup]` |
| WARN | *(cliente)* | `[lookupFriendUid] API error` em `lib/firebase/friends.ts` quando `!res.ok` |

## Objetivo

Detectar falhas Admin SDK ou pedidos malformados sem gravar emails ou UIDs alvo.

## Destino

Stdout / consola browser (warn cliente).
