# DOC_API_Index

## Next.js Route Handlers (`app/api/`)

| Método | Rota | Ficheiro |
|--------|------|----------|
| `POST` | `/api/runs/complete` | [`app/api/runs/complete/route.ts`](../../app/api/runs/complete/route.ts) |
| `POST` | `/api/territories/capture` | [`app/api/territories/capture/route.ts`](../../app/api/territories/capture/route.ts) |
| `POST` | `/api/friends/lookup` | [`app/api/friends/lookup/route.ts`](../../app/api/friends/lookup/route.ts) |
| `POST` | `/api/auth/resolve-identifier` | [`app/api/auth/resolve-identifier/route.ts`](../../app/api/auth/resolve-identifier/route.ts) |

## “APIs” implícitas (SDK)

- **Firebase Auth / Firestore** no cliente — chamadas via SDK, não HTTP REST próprio. Ver [DOC_FirebaseClientCalls.md](DOC_FirebaseClientCalls.md).

## Cloud Functions (Firebase)

Deploy separado do Next — ver [DOC_CloudFunctions.md](DOC_CloudFunctions.md).
