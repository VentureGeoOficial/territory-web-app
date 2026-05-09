# DOC_ServicesIndex

Índice dos módulos de serviço / integração da aplicação.

| Documento | Módulo | Responsabilidade |
|-----------|--------|------------------|
| [DOC_AuthService.md](DOC_AuthService.md) | [`lib/auth/auth-service.ts`](../../lib/auth/auth-service.ts) | Login, Google, reset, registo, troca/exclusão conta |
| [DOC_FirebaseSession.md](DOC_FirebaseSession.md) | [`lib/auth/firebase-session.ts`](../../lib/auth/firebase-session.ts) | Conversão Firebase User → AuthSession |
| [DOC_FirebaseConfig.md](DOC_FirebaseConfig.md) | [`lib/config/firebase-env.ts`](../../lib/config/firebase-env.ts) + [`lib/firebase/config.ts`](../../lib/firebase/config.ts) | Env público validado |
| [DOC_FirebaseClient.md](DOC_FirebaseClient.md) | [`lib/firebase/client.ts`](../../lib/firebase/client.ts) | Singleton App/Auth/Firestore cliente |
| [DOC_FirebaseAdminApp.md](DOC_FirebaseAdminApp.md) | [`lib/firebase/admin-app.ts`](../../lib/firebase/admin-app.ts) | Admin SDK (servidor) |
| [DOC_TerritoriesService.md](DOC_TerritoriesService.md) | [`lib/firebase/territories.ts`](../../lib/firebase/territories.ts) | Subscribe + save território |
| [DOC_RankingService.md](DOC_RankingService.md) | [`lib/firebase/ranking.ts`](../../lib/firebase/ranking.ts) | Leaderboard `publicProfiles` |
| [DOC_FriendsService.md](DOC_FriendsService.md) | [`lib/firebase/friends.ts`](../../lib/firebase/friends.ts) | Pedidos e amigos |
| [DOC_UserProfileService.md](DOC_UserProfileService.md) | [`lib/firebase/user-profile.ts`](../../lib/firebase/user-profile.ts) | CRUD perfil, usernames |
| [DOC_RunCompletionService.md](DOC_RunCompletionService.md) | [`lib/firebase/run-completion.ts`](../../lib/firebase/run-completion.ts) | Corrida + território transação |
| [DOC_NotificationPreferencesService.md](DOC_NotificationPreferencesService.md) | [`lib/firebase/notification-preferences.ts`](../../lib/firebase/notification-preferences.ts) | Preferências notificações |
| [DOC_TransactionsService.md](DOC_TransactionsService.md) | [`lib/firebase/transactions.ts`](../../lib/firebase/transactions.ts) | Captura hostil (Admin) |
| [DOC_LocationService.md](DOC_LocationService.md) | [`lib/services/location-service.ts`](../../lib/services/location-service.ts) | GPS / watch track |
| [DOC_TerritoryRepository.md](DOC_TerritoryRepository.md) | [`lib/data/territory-repository.ts`](../../lib/data/territory-repository.ts) | Fábrica repositório Firebase |
