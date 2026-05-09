# DOC_FirestoreRules

**Ficheiro:** [`firestore.rules`](../../firestore.rules)

## Resumo por coleção

| Path | Read | Write |
|------|------|-------|
| `users/{userId}` | Dono (`request.auth.uid == userId`) | create/update dono; **delete negado** |
| `publicProfiles/{userId}` | **Público** | create/update dono |
| `usersPrivate/{userId}` | Dono | create/update dono; delete negado |
| `usernames/{slug}` | Público | create se auth e `uid` correto e doc não existe; update/delete negados |
| `territories/{id}` | **Público** (`true`) | create/update com validação `isValidTerritoryPayload()` e dono em updates/deletes |
| `runs/{runId}` | Dono (`resource.data.userId`) | create com campos validados; update/delete negados |
| `friendRequests/{id}` | Remetente ou destinatário | create pending como remetente; update por envolvidos |

## Função `isValidTerritoryPayload` (territories)

Garante: `userId == request.auth.uid`, área 0 < areaM2 ≤ 10_000_000, `status` enum, `polygonJson` string ≤ 200000 chars.

## Implicações de segurança

- Leitura de **todo** o mapa de territórios é pública — qualquer cliente pode listar polígonos (design para mapa global).
- `users` não é legível por outros utilizadores nas rules atuais — ranking pode depender de `publicProfiles` ou de agregação noutra camada (ver código que lê `users`).

Documentação de risco alinhada: [SEC_FirestoreRules.md](../Seguranca/SEC_FirestoreRules.md).
