'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { AuthenticatedShell } from '@/components/layout/authenticated-shell'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { changePassword } from '@/lib/auth/auth-service'
import { changePasswordSchema, type ChangePasswordValues } from '@/lib/auth/schemas'

export default function SegurancaPage() {
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  async function onSubmit(values: ChangePasswordValues) {
    await changePassword(values.currentPassword, values.newPassword)
    toast.success('Senha alterada com sucesso.')
    form.reset()
  }

  return (
    <AuthenticatedShell>
      <div className="space-y-6 pb-16 lg:pb-0">
        <div>
          <h1 className="text-2xl font-bold">Segurança da conta</h1>
          <p className="text-sm text-muted-foreground">
            Política: mínimo de 8 caracteres, combinar letras, números e símbolos.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Alterar senha</CardTitle>
            <CardDescription>
              A alteração exige confirmação da senha atual para maior segurança.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={form.handleSubmit((v) => void onSubmit(v))}>
              <div className="grid gap-2">
                <Label>Senha atual</Label>
                <Input type="password" {...form.register('currentPassword')} />
              </div>
              <div className="grid gap-2">
                <Label>Nova senha</Label>
                <Input type="password" {...form.register('newPassword')} />
              </div>
              <div className="grid gap-2">
                <Label>Confirmar nova senha</Label>
                <Input type="password" {...form.register('confirmPassword')} />
              </div>
              <Button type="submit">Salvar nova senha</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <MobileBottomNav />
    </AuthenticatedShell>
  )
}
