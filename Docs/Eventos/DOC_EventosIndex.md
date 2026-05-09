# DOC_EventosIndex

| Origem | Tipo de evento | Consumidores |
|--------|------------------|--------------|
| Firebase Auth | `onAuthStateChanged` | [`AuthProvider`](../../components/auth/auth-provider.tsx) |
| Firestore | `onSnapshot` territórios, ranking, pedidos, `publicProfiles` | hooks em [`hooks/`](../../hooks/), [`lib/firebase/*`](../../lib/firebase/) |
| DOM | `beforeinstallprompt`, `appinstalled` | [`useInstallPrompt`](../../lib/pwa/use-install-prompt.ts) |
| DOM | `geolocation` position | [`location-service`](../../lib/services/location-service.ts), run hooks |
| UI | Sonner toast | componentes que importam `toast` / `sonner` |
| Schedule | `onSchedule` Firebase | [`expireStaleTerritories`](../../functions/src/index.ts) |

Não há **WebSockets** nem **EventSource** nativos da app.
