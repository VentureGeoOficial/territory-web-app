'use client'

import * as React from 'react'
import { Mail, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { resendEmailVerification } from '@/lib/auth/auth-service'
import { AuthError } from '@/lib/auth/types'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

/**
 * Banner não-bloqueante quando o e-mail ainda não foi verificado.
 */
export function EmailVerificationBanner() {
  const [verified, setVerified] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const [checking, setChecking] = React.useState(true)

  React.useEffect(() => {
    if (!isFirebaseConfigured()) {
      setChecking(false)
      return
    }

    let cancelled = false

    void (async () => {
      const { getFirebaseAuth } = await import('@/lib/firebase/client')
      const user = getFirebaseAuth().currentUser
      if (cancelled) return
      if (!user) {
        setVerified(true)
        setChecking(false)
        return
      }
      setVerified(user.emailVerified)
      setChecking(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleResend() {
    setLoading(true)
    try {
      await resendEmailVerification()
      toast.success('E-mail de verificação reenviado.')
    } catch (err) {
      const message =
        err instanceof AuthError
          ? err.message
          : 'Não foi possível reenviar. Tente novamente.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setLoading(true)
    try {
      const { getFirebaseAuth } = await import('@/lib/firebase/client')
      const user = getFirebaseAuth().currentUser
      if (!user) return
      await user.reload()
      setVerified(user.emailVerified)
      if (user.emailVerified) {
        toast.success('E-mail verificado com sucesso!')
      } else {
        toast.info('Ainda não detectámos a verificação. Confira a sua caixa de entrada.')
      }
    } catch {
      toast.error('Não foi possível atualizar o estado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (checking || verified) return null

  return (
    <Alert className="mb-4 border-amber-500/40 bg-amber-500/10">
      <Mail className="size-4 text-amber-600" />
      <AlertTitle>Verifique o seu e-mail</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-sm">
          Enviámos um link de confirmação. Pode continuar a usar a aplicação, mas
          recomendamos verificar o e-mail para recuperar a conta com segurança.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={() => void handleResend()}
          >
            <RefreshCw className="mr-1 size-3" />
            Reenviar e-mail
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={loading}
            onClick={() => void handleRefresh()}
          >
            Já verifiquei
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
