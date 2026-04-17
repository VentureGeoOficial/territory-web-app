'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AuthenticatedShell } from '@/components/layout/authenticated-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteAccount, signOutRemote } from '@/lib/auth/auth-service'
import { useAuthStore } from '@/lib/store/auth-store'

export default function ExcluirContaPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const logout = useAuthStore((s) => s.logout)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    try {
      await deleteAccount(password)
      await signOutRemote()
      logout()
      toast.success('Conta excluída com sucesso.')
      router.replace('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthenticatedShell>
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">Excluir conta</h1>
        <Card>
          <CardHeader>
            <CardTitle>Antes de sair, considere estes benefícios</CardTitle>
            <CardDescription>
              Manter sua conta preserva histórico, ranking, troféus e progresso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>- Seu histórico territorial continua disponível.</p>
            <p>- Você mantém comparativos e amizades no app.</p>
            <p>- Pode pausar notificações sem excluir conta.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Confirmação segura</CardTitle>
            <CardDescription>
              Para excluir permanentemente, confirme com sua senha atual.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Senha atual</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={!password || loading}>
                  Excluir minha conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmação final</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação remove seu acesso e não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={() => void handleDelete()}
                  >
                    Confirmar exclusão
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedShell>
  )
}
