# DOC_FluxoEsqueciSenha

1. Página [`/esqueci-senha`](../../app/esqueci-senha/page.tsx) renderiza [`ForgotPasswordForm`](../../components/auth/forgot-password-form.tsx).
2. Submissão → `requestPasswordReset({ email })` → `sendPasswordResetEmail` Firebase.
3. Feedback UX via estado do formulário (toast/mensagens conforme implementação no componente).
