'use client'

import * as React from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'

import { requestPasswordReset } from '@/lib/auth/auth-service'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/lib/auth/schemas'
import { AuthError } from '@/lib/auth/types'
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

export function ForgotPasswordForm({ className }: { className?: string }) {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: ForgotPasswordFormValues) {
    try {
      await requestPasswordReset(data)
      toast.success('Se existir uma conta, enviaremos instruções por e-mail.')
    } catch (err) {
      const message =
        err instanceof AuthError
          ? err.message
          : 'Não foi possível enviar. Tente novamente.'
      toast.error(message)
    }
  }

  const submitting = form.formState.isSubmitting

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-5', className)}
      >
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

        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Spinner className="size-4" />
              Enviando...
            </>
          ) : (
            <>
              <Mail className="size-4" />
              Enviar instruções
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-accent hover:underline">
            Voltar ao login
          </Link>
        </p>
      </form>
    </Form>
  )
}
