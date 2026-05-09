# DOC_Formularios

Todos usam **react-hook-form** + **zodResolver** + schemas em [`lib/auth/schemas.ts`](../../lib/auth/schemas.ts).

| Formulário | Ficheiro | Schema principal |
|------------|----------|------------------|
| Login | [`login-form.tsx`](../../components/auth/login-form.tsx) | `loginSchema` |
| Cadastro | [`signup-form.tsx`](../../components/auth/signup-form.tsx) | signup |
| Esqueci senha | [`forgot-password-form.tsx`](../../components/auth/forgot-password-form.tsx) | email |
| Conta | [`conta/page.tsx`](../../app/(authenticated)/conta/page.tsx) | `accountProfileSchema`, `notificationPreferencesSchema` |
| Segurança | [`seguranca/page.tsx`](../../app/(authenticated)/seguranca/page.tsx) | `changePasswordSchema` |
| Excluir conta | [`conta/excluir/page.tsx`](../../app/(authenticated)/conta/excluir/page.tsx) | campo senha (controlled, não RHF global) |

Rate limit em login/cadastro/amigos via [`useRateLimit`](../../hooks/use-rate-limit.ts).
