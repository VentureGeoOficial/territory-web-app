'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { registerWithFirebase } from '@/lib/auth/auth-service'
import { signupSchema, type SignupFormValues } from '@/lib/auth/schemas'
import { AuthError } from '@/lib/auth/types'
import {
  selectIsAuthenticated,
  useAuthStore,
} from '@/lib/store/auth-store'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { useRateLimit } from '@/hooks/use-rate-limit'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FloatingInput } from '@/components/ui/floating-input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const sexoLabels: Record<SignupFormValues['sexo'], string> = {
  male: 'Masculino',
  female: 'Feminino',
  other: 'Outro',
  prefer_not: 'Prefiro não informar',
}

export function SignupForm({ className }: { className?: string }) {
  const router = useRouter()
  const setSession = useAuthStore((s) => s.setSession)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  
  // Rate limiting: max 3 tentativas por minuto, intervalo minimo de 2s
  const { canExecute, recordExecution, isLimited, attemptsRemaining } = useRateLimit({
    minInterval: 2000,
    maxAttempts: 3,
    windowMs: 60000,
  })

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, router])

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      nomeCompleto: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      dataNascimento: '',
      sexo: undefined as unknown as SignupFormValues['sexo'],
      peso: undefined as unknown as number,
      altura: undefined as unknown as number,
    },
  })

  async function onSubmit(data: SignupFormValues) {
    form.clearErrors('root')
    
    // Verifica rate limit antes de submeter
    if (!canExecute()) {
      const message = `Muitas tentativas. Aguarde um momento antes de tentar novamente. (${attemptsRemaining} tentativas restantes)`
      form.setError('root', { message })
      toast.error(message)
      return
    }
    
    recordExecution()
    
    try {
      const session = await registerWithFirebase(data)
      setSession(session)
      toast.success('Conta criada com sucesso!')
      router.replace('/')
    } catch (err) {
      const message =
        err instanceof AuthError
          ? err.message
          : 'Não foi possível criar a conta. Tente novamente.'
      form.setError('root', { message })
      toast.error(message)
    }
  }

  const submitting = form.formState.isSubmitting

  if (!isFirebaseConfigured()) {
    return (
      <Alert variant="destructive" className="border-destructive/50">
        <AlertTitle>Firebase não configurado</AlertTitle>
        <AlertDescription>
          Defina as variáveis <code className="text-xs">NEXT_PUBLIC_FIREBASE_*</code> no
          ficheiro <code className="text-xs">.env.local</code> para criar uma conta.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-4', className)}
      >
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="nomeCompleto"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <FloatingInput
                  label="Nome completo"
                  autoComplete="name"
                  disabled={submitting}
                  error={fieldState.error?.message}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <FloatingInput
                  label="Nome de usuário"
                  autoComplete="username"
                  disabled={submitting}
                  error={fieldState.error?.message}
                  {...field}
                  onChange={(e) =>
                    field.onChange(e.target.value.toLowerCase())
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <FloatingInput
                  label="E-mail"
                  type="email"
                  autoComplete="email"
                  disabled={submitting}
                  error={fieldState.error?.message}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <FloatingInput
                    label="Senha"
                    type="password"
                    autoComplete="new-password"
                    disabled={submitting}
                    error={fieldState.error?.message}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <FloatingInput
                    label="Confirmar senha"
                    type="password"
                    autoComplete="new-password"
                    disabled={submitting}
                    error={fieldState.error?.message}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="dataNascimento"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-muted-foreground">
                Data de nascimento
              </FormLabel>
              <FormControl>
                <input
                  type="date"
                  className={cn(
                    'flex h-12 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none',
                    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    'disabled:opacity-50 dark:bg-input/30',
                    fieldState.error && 'border-destructive',
                  )}
                  disabled={submitting}
                  max={new Date(
                    new Date().setFullYear(new Date().getFullYear() - 13),
                  )
                    .toISOString()
                    .slice(0, 10)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sexo"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-muted-foreground">
                Sexo
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={submitting}
              >
                <FormControl>
                  <SelectTrigger
                    className={cn(
                      'h-12 w-full rounded-xl',
                      fieldState.error && 'border-destructive',
                    )}
                  >
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(Object.keys(sexoLabels) as SignupFormValues['sexo'][]).map(
                    (key) => (
                      <SelectItem key={key} value={key}>
                        {sexoLabels[key]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="peso"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <FloatingInput
                    label="Peso (kg)"
                    type="number"
                    step="0.1"
                    min={30}
                    max={300}
                    disabled={submitting}
                    error={fieldState.error?.message}
                    value={field.value === undefined ? '' : field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ''
                          ? undefined
                          : parseFloat(e.target.value),
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="altura"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <FloatingInput
                    label="Altura (cm)"
                    type="number"
                    step="1"
                    min={100}
                    max={250}
                    disabled={submitting}
                    error={fieldState.error?.message}
                    value={field.value === undefined ? '' : field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ''
                          ? undefined
                          : parseInt(e.target.value, 10),
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="mt-2 w-full h-12 text-base font-semibold"
          disabled={submitting || isLimited}
        >
          {submitting ? (
            <>
              <Spinner className="size-4" />
              Criando conta...
            </>
          ) : isLimited ? (
            <>Aguarde um momento...</>
          ) : (
            <>
              <UserPlus className="size-4" />
              Criar conta
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
