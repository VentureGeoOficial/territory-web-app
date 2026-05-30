'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { claimUsernameSlug } from '@/lib/firebase/user-profile'
import { FRIEND_USERNAME_SLUG_PATTERN } from '@/lib/firebase/friends'
import { useAuthStore } from '@/lib/store/auth-store'
import { AuthenticatedShell } from '@/components/layout/authenticated-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

export default function CompletarPerfilPage() {
  const router = useRouter()
  const uid = useAuthStore((s) => s.user?.id)
  const [username, setUsername] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!uid) return

    const slug = username.trim().replace(/^@/, '').toLowerCase()
    if (!FRIEND_USERNAME_SLUG_PATTERN.test(slug)) {
      toast.error('Username inválido. Use 3–30 caracteres: letras minúsculas, números ou _.')
      return
    }

    setSubmitting(true)
    try {
      await claimUsernameSlug(uid, slug)
      toast.success('Nome de usuário definido.')
      router.replace('/mapa')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'USERNAME_TAKEN') {
        toast.error('Este nome de usuário já está em uso.')
      } else if (msg === 'USERNAME_ALREADY_SET') {
        router.replace('/mapa')
      } else {
        toast.error('Não foi possível guardar o username. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthenticatedShell>
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Completar perfil</CardTitle>
            <CardDescription>
              Escolha um nome de usuário público (@slug). É o mesmo que os amigos usam para
              o encontrar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Nome de usuário</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    @
                  </span>
                  <Input
                    id="username"
                    className="pl-8"
                    placeholder="nome_publico"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    disabled={submitting}
                    autoComplete="username"
                  />
                </div>
              </div>
              <Button type="submit" disabled={submitting || !username.trim()}>
                {submitting ? (
                  <>
                    <Spinner className="size-4" />
                    A guardar...
                  </>
                ) : (
                  'Continuar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedShell>
  )
}
