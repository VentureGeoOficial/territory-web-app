import { z } from 'zod'

function ageFromIsoDate(iso: string): number {
  const birth = new Date(iso + 'T12:00:00')
  if (Number.isNaN(birth.getTime())) return -1
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe o e-mail')
    .email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe o e-mail')
    .email('E-mail inválido'),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

const usernameRegex = /^[a-z0-9_]{3,30}$/

export const signupSchema = z
  .object({
    nomeCompleto: z
      .string()
      .trim()
      .min(3, 'Nome deve ter pelo menos 3 caracteres'),
    username: z
      .string()
      .trim()
      .min(1, 'Informe o nome de usuário')
      .transform((s) => s.toLowerCase())
      .pipe(
        z
          .string()
          .regex(
            usernameRegex,
            'Use apenas letras minúsculas, números e _ (3 a 30 caracteres)',
          ),
      ),
    email: z
      .string()
      .min(1, 'Informe o e-mail')
      .email('E-mail inválido'),
    password: z
      .string()
      .min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
    dataNascimento: z
      .string()
      .min(1, 'Informe a data de nascimento')
      .refine((s) => ageFromIsoDate(s) >= 13, {
        message: 'É necessário ter pelo menos 13 anos',
      }),
    sexo: z.enum(['male', 'female', 'other', 'prefer_not'], {
      required_error: 'Selecione uma opção',
    }),
    peso: z.coerce
      .number({ invalid_type_error: 'Informe um número válido' })
      .min(30, 'Peso entre 30 e 300 kg')
      .max(300, 'Peso entre 30 e 300 kg'),
    altura: z.coerce
      .number({ invalid_type_error: 'Informe um número válido' })
      .min(100, 'Altura entre 100 e 250 cm')
      .max(250, 'Altura entre 100 e 250 cm'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type SignupFormValues = z.infer<typeof signupSchema>
