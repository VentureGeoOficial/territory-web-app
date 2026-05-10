# DOC_FirebaseClientCalls

Mapeamento de **onde** o SDK Firebase (cliente) é usado — sem listar cada linha.

## Inicialização

- [`lib/firebase/client.ts`](../../lib/firebase/client.ts) — `initializeApp`, `getAuth`, `initializeFirestore` \| `getFirestore`.

## Módulos que chamam Firestore/Auth (direto ou via helpers)

| Área | Ficheiros |
|------|-----------|
| Subscrições | `lib/firebase/territories.ts`, `ranking.ts`, `friends.ts` |
| Escritas / transações cliente | `territories.ts`, `user-profile.ts`, `run-completion.ts` |
| Perfil | `user-profile.ts` |
| Hook snapshot | `hooks/use-public-profile-sync.ts` → [`subscribePublicProfile`](../../lib/firebase/user-profile.ts) |
| Auth | `lib/auth/auth-service.ts` (import dinâmico) |

## HTTP `fetch` da app

- [`lib/firebase/run-completion.ts`](../../lib/firebase/run-completion.ts) — `submitCompletedRunViaApi` (`POST /api/runs/complete`) e `submitTerritoryCaptureViaApi` (`POST /api/territories/capture`).
- Ver [DOC_API_TerritoriesCapture.md](DOC_API_TerritoriesCapture.md) para a rota de captura.
