'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Map } from 'lucide-react'

import { login } from '@/lib/auth/auth-service'
import { loginSchema, type LoginFormValues } from '@/lib/auth/schemas'
import { AuthError } from '@/lib/auth/types'
import {
  selectIsAuthenticated,
  useAuthStore,
} from '@/lib/store/auth-store'
import { useRateLimit } from '@/hooks/use-rate-limit'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

export function LoginForm({ className }: { className?: string }) {
  const router = useRouter()
  const setSession = useAuthStore((s) => s.setSession)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const [showPassword, setShowPassword] = React.useState(false)
  
  // Rate limiting: max 5 tentativas por minuto, intervalo minimo de 1s
  const { canExecute, recordExecution, isLimited } = useRateLimit({
    minInterval: 1000,
    maxAttempts: 5,
    windowMs: 60000,
  })

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, router])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginFormValues) {
    form.clearErrors('root')
    
    if (!canExecute()) {
      form.setError('root', { message: 'Muitas tentativas. Aguarde um momento.' })
      return
    }
    
    recordExecution()
    
    try {
      const session = await login(data)
      setSession(session)
      router.replace('/')
    } catch (err) {
      const message =
        err instanceof AuthError
          ? err.message
          : 'Não foi possível entrar. Tente novamente.'
      form.setError('root', { message })
    }
  }

  const submitting = form.formState.isSubmitting

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-5', className)}
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  disabled={submitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Senha</FormLabel>
                <Link
                  href="/esqueci-senha"
                  className="text-xs text-accent hover:underline"
                  tabIndex={-1}
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="pr-10"
                    disabled={submitting}
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  disabled={submitting}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={submitting || isLimited}
        >
          {submitting ? (
            <>
              <Spinner className="size-4" />
              Entrando...
            </>
          ) : isLimited ? (
            <>Aguarde...</>
          ) : (
            <>
              <Map className="size-4" />
              Entrar
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
