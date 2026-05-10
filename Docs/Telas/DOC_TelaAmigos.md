# DOC_TelaAmigos

**Rota:** `/amigos`  
**Ficheiro:** [`app/(authenticated)/amigos/page.tsx`](../../app/(authenticated)/amigos/page.tsx)

## Fluxo

- Pedido por **@username** (slug público): `lookupFriendUid({ username, idToken })` → API Admin resolve `usernames/{slug}` (e-mail não é pedido na UI).
- Validação cliente: `validateNoExistingFriendship` + regex `FRIEND_USERNAME_SLUG_PATTERN`; servidor valida slug.
- Após lookup bem-sucedido: `sendFriendRequest` (com guard de duplicados no cliente e no `friends.ts`).
- Subscrições: pedidos `pending` recebidos/enviados; lista de amigos aceites via `useFriendIds` + `useFriendProfiles` (`publicProfiles`: nome, `@username`, cor, área, avatar se existir em dados públicos).
- Firebase não configurado — card aviso.

## UX

- Pedidos recebidos ordenados por `createdAt` descendente; região com `aria-live="polite"`.
- Rate limit cliente no envio (mesmo `useRateLimit` anterior).
