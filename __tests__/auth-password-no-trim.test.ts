import { describe, expect, it } from 'vitest'
import { loginSchema, signupSchema } from '@/lib/auth/schemas'

describe('password no edge spaces', () => {
  const baseSignup = {
    nomeCompleto: 'João Silva',
    username: 'joao_silva',
    email: 'joao@example.com',
    confirmPassword: 'secret12',
    dataNascimento: '2000-01-15',
    sexo: 'male' as const,
    peso: 70,
    altura: 175,
  }

  it('signup rejects password with leading space', () => {
    const result = signupSchema.safeParse({
      ...baseSignup,
      password: ' secret12',
      confirmPassword: ' secret12',
    })
    expect(result.success).toBe(false)
  })

  it('signup rejects password with trailing space', () => {
    const result = signupSchema.safeParse({
      ...baseSignup,
      password: 'secret12 ',
      confirmPassword: 'secret12 ',
    })
    expect(result.success).toBe(false)
  })

  it('signup accepts password with internal spaces', () => {
    const result = signupSchema.safeParse({
      ...baseSignup,
      password: 'my secret',
      confirmPassword: 'my secret',
    })
    expect(result.success).toBe(true)
  })

  it('login rejects password with edge spaces', () => {
    const result = loginSchema.safeParse({
      email: 'joao@example.com',
      password: ' secret12',
    })
    expect(result.success).toBe(false)
  })

  it('login accepts valid password without edge spaces', () => {
    const result = loginSchema.safeParse({
      email: 'joao@example.com',
      password: 'secret12',
    })
    expect(result.success).toBe(true)
  })
})
