# DOC_UserProfileService

**Ficheiro:** [`lib/firebase/user-profile.ts`](../../lib/firebase/user-profile.ts)

## Principais exports

| Função | Descrição |
|--------|-----------|
| `createUserProfileAfterSignup` | Transação: reserva `usernames/{slug}` (`uid`, `createdAt` = epoch ms cliente), cria `users`, `publicProfiles`, `usersPrivate` |
| `ensureUserProfile` | Garante doc mínimo em `users` após login |
| `getUserProfile` | Leitura `users/{uid}` (só o próprio utilizador pelas rules) |
| `getPublicProfileSummary` | Leitura `publicProfiles/{uid}` para dados públicos (ex.: lista de amigos) |
| `subscribePublicProfile` | `onSnapshot(publicProfiles/{uid})` — usado pelo hook de sync; erro opcional no callback |
| `updateNotificationPreferences` | Atualiza campos em `users`, `publicProfiles`, `usersPrivate` conforme implementação |
| Outras atualizações de perfil | Update docs dispersos (avatar, legal, etc.) — ver ficheiro completo |

## Tipos

- `UserProfileDoc` — espelho dos campos persistidos em `users`.

## Dependências

- `generateStableUserColor` — [`lib/territory/geo.ts`](../../lib/territory/geo.ts)
- `LEGAL_VERSION` — [`lib/app-info.ts`](../../lib/app-info.ts)
