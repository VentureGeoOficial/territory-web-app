# Observabilidade — `app/api/friends/lookup/route.ts`

## Logs

| Nível | Momento | Mensagem |
|-------|---------|----------|
| ERROR | Exceção não tratada | `[api/friends/lookup]` |
| WARN | *(cliente)* | `[lookupFriendUid] API error` em `lib/firebase/friends.ts` quando `!res.ok` |

## Objetivo

Detectar falhas Admin SDK ou pedidos malformados sem gravar emails ou UIDs alvo.

## Destino

Stdout / consola browser (warn cliente).
