# Checklist operacional — Protótipo territorial (Firebase)

Publicar no projeto Firebase de testes **antes** da demo com captura entre amigos e notificações.

## O que já funciona hoje

O fluxo social de **convite e aceite** (`friendRequests`) já está operacional: enviar pedido, o outro utilizador recebe e aceita na app. Isso **não precisa ser refeito**.

O mapa e a captura territorial usam outra coleção — o grafo `friendships/{uid}/list/{friendUid}` — que é preenchido **automaticamente** quando alguém aceita um pedido:

- **API Next.js** `POST /api/friends/accept` (Admin SDK) — caminho principal do protótipo
- **Cloud Function** `onFriendRequestStatusChange` — rede de segurança opcional (idempotente)

Se amigos já se veem no mapa e a captura funciona, este passo provavelmente já está ok.

O **backfill** abaixo só é necessário para amizades aceites **antes** da Cloud Function existir, ou se captura retornar `403 NOT_FRIEND` com amizade visível na lista.

Para **username**: após alterações de cadastro, publicar `firestore.rules` actualizado. Desactivar **Google** em Authentication → Sign-in method (login só por e-mail). Backfill `npm run backfill:usernames` só se existirem `users.username` sem doc `usernames/{slug}`.

## Ordem recomendada (só o que ainda faltar)

1. Confirmar Cloud Function `onFriendRequestStatusChange` publicada (região `southamerica-east1`) — ou pular se aceites recentes já criam docs em `friendships/.../list/...`.
2. Backfill do grafo `friendships` **somente** se amizades antigas não tiverem arestas.
3. Publicar `firestore.rules` (territórios + `users/{uid}/notifications`).
4. Publicar `firestore.indexes.json` (índice `notifications` + `createdAt` descendente).
5. Aguardar índice composto ficar **ativo** no console (pode levar alguns minutos).
6. Confirmar `FIREBASE_SERVICE_ACCOUNT_JSON` no ambiente do servidor Next.js.

## Validação rápida

- Aceitar um pedido de amizade e verificar documentos em `friendships/{uidA}/list/{uidB}` e o inverso.
- Vítima logada: listener de notificações sem erro no console.
- Atacante: captura com emoji conclui sem `403 NOT_FRIEND`.

## Se algo falhar

| Sintoma | Causa provável |
|---------|----------------|
| Amigo na lista mas mapa vazio | Grafo `friendships` ausente — backfill ou CF |
| `403 NOT_FRIEND` na captura | Aresta só num sentido ou backfill não corrido |
| Toast de notificação nunca aparece | Rules/index não publicados ou vítima offline na captura |
| Erro de índice no console | Índice `notifications` ainda em construção |
