# DOC_FluxoTrocaSenha

1. [`/seguranca`](../../app/(authenticated)/seguranca/page.tsx) formulário `changePasswordSchema`.
2. Submit → `changePassword(current, new)` em [`auth-service`](../../lib/auth/auth-service.ts).
3. Internamente: `EmailAuthProvider.credential`, `reauthenticateWithCredential`, `updatePassword`.
4. Toast sucesso; form reset.
