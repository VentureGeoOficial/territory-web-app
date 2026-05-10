# DOC_FluxoCadastro

```mermaid
flowchart TD
  SF[SignupForm submit] --> RV{validate Zod}
  RV -->|fail| Err[show errors]
  RV -->|ok| RW[registerWithFirebase]
  RW --> CA[createUserWithEmailAndPassword]
  CA --> UP[updateProfile displayName]
  UP --> TX[createUserProfileAfterSignup transaction]
  TX -->|USERNAME_TAKEN| RB[deleteUser rollback]
  TX -->|ok| SESS[firebaseUserToSession]
  SESS --> Store[setSession]
  Store --> Nav[router replace mapa or home]
```

## Observabilidade e erros (cliente)

- Códigos mapeados em [`registerWithFirebase`](../../lib/auth/auth-service.ts): `operation-not-allowed`, `network-request-failed`, `permission-denied`, transiente Firestore (`failed-precondition`, `aborted`, `unavailable`, `resource-exhausted`). Ver [DOC_auth-service.ts.md](../Services/DOC_auth-service.ts.md).
- **`usernames/{slug}.createdAt`**: escrito como `Date.now()` (inteiro cliente) para alinhar com `firestore.rules` (`timestamp` \| `int`).
