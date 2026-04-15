# Feature: Cadastro de utilizador

## Descrição

Fluxo público em **`/cadastro`** para criar conta com **Firebase Authentication** (email/senha) e persistir perfil antropométrico e identidade no **Firestore**.

## Fluxo

1. Utilizador preenche o formulário (validação no cliente com Zod).
2. `createUserWithEmailAndPassword` cria a conta no Auth.
3. `updateProfile` define o **display name** com o nome completo.
4. Transação Firestore:
   - cria `usernames/{slug}` com `{ uid }` se o slug estiver livre;
   - cria `users/{uid}` com todos os campos de perfil e stats iniciais (área 0, XP 0).
5. Se a transação falhar (ex.: username tomado), o utilizador Auth recém-criado é **removido** com `deleteUser` para evitar estado inconsistente.

## Validações (`signupSchema` em `lib/auth/schemas.ts`)

| Campo | Regra |
|-------|--------|
| Nome completo | Mínimo 3 caracteres |
| Username | `^[a-z0-9_]{3,30}$`, sem espaços (normalizado em minúsculas) |
| E-mail | Formato válido |
| Senha | Mínimo 6 caracteres; confirmação igual |
| Data de nascimento | Idade mínima **13 anos** |
| Sexo | `male` \| `female` \| `other` \| `prefer_not` |
| Peso | 30–300 kg |
| Altura | 100–250 cm |

## Integração

- Serviço: `registerWithFirebase` em [`lib/auth/auth-service.ts`](../lib/auth/auth-service.ts).
- Perfil + username: [`createUserProfileAfterSignup`](../lib/firebase/user-profile.ts).
- Sem variáveis Firebase no ambiente, o formulário mostra aviso e não submete.

## UI/UX

- Layout alinhado a `/login` (gradiente, card, marca).
- Inputs com componente [`FloatingInput`](../components/ui/floating-input.tsx) (label flutuante + erro).
- Data e sexo: campos dedicados (date + `Select`).
- Botões globais usam variantes atualizadas em [`components/ui/button.tsx`](../components/ui/button.tsx) (bordas `rounded-xl`, hover/active com escala suave).

## Ficheiros principais

- [`app/cadastro/page.tsx`](../app/cadastro/page.tsx)
- [`components/auth/signup-form.tsx`](../components/auth/signup-form.tsx)
