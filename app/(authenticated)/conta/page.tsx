'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { AuthenticatedShell } from '@/components/layout/authenticated-shell'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/lib/store/auth-store'
import {
  accountProfileSchema,
  notificationPreferencesSchema,
  type AccountProfileValues,
  type NotificationPreferencesValues,
} from '@/lib/auth/schemas'
import {
  getUserProfile,
  recordLegalAcceptance,
  updateUserProfile,
} from '@/lib/firebase/user-profile'
import { saveNotificationPreferences } from '@/lib/firebase/notification-preferences'
import Link from 'next/link'

export default function ContaPage() {
  const uid = useAuthStore((s) => s.user?.id)
  const email = useAuthStore((s) => s.user?.email) ?? ''
  const [loading, setLoading] = React.useState(true)

  const profileForm = useForm<AccountProfileValues>({
    resolver: zodResolver(accountProfileSchema),
    defaultValues: {
      nomeCompleto: '',
      displayName: '',
      username: '',
      dataNascimento: '',
      sexo: 'prefer_not',
      peso: 70,
      altura: 170,
      avatarUrl: '',
      backgroundUrl: '',
    },
  })

  const notificationForm = useForm<NotificationPreferencesValues>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: { app: true, email: false, whatsapp: false, frequency: 'daily' },
  })

  React.useEffect(() => {
    if (!uid) return
    void (async () => {
      try {
        const profile = await getUserProfile(uid)
        if (!profile) return
        profileForm.reset({
          nomeCompleto: profile.nomeCompleto ?? profile.displayName,
          displayName: profile.displayName,
          username: profile.username ?? '',
          dataNascimento: profile.dataNascimento ?? '',
          sexo: profile.sexo ?? 'prefer_not',
          peso: profile.peso ?? 70,
          altura: profile.altura ?? 170,
          avatarUrl: profile.avatarUrl ?? '',
          backgroundUrl: profile.backgroundUrl ?? '',
        })
        notificationForm.reset(
          profile.notificationPreferences ?? {
            app: true,
            email: false,
            whatsapp: false,
            frequency: 'daily',
          },
        )
      } finally {
        setLoading(false)
      }
    })()
  }, [uid, profileForm, notificationForm])

  async function onSaveProfile(values: AccountProfileValues) {
    if (!uid) return
    await updateUserProfile(uid, values)
    toast.success('Perfil atualizado com sucesso.')
  }

  async function onSaveNotifications(values: NotificationPreferencesValues) {
    if (!uid) return
    await saveNotificationPreferences(uid, values)
    toast.success('Preferências de notificação atualizadas.')
  }

  async function onAcceptLegal() {
    if (!uid) return
    await recordLegalAcceptance(uid)
    toast.success('Aceite de termos e privacidade registrado.')
  }

  return (
    <AuthenticatedShell>
      <div className="space-y-6 pb-16 lg:pb-0">
        <div>
          <h1 className="text-2xl font-bold">Conta</h1>
          <p className="text-sm text-muted-foreground">
            Atualize seus dados pessoais e preferências. CPF e e-mail são bloqueados.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Dados pessoais</CardTitle>
            <CardDescription>Campos de perfil e personalização visual.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando perfil...</p>
            ) : (
              <form
                className="grid gap-4"
                onSubmit={profileForm.handleSubmit((values) =>
                  void onSaveProfile(values),
                )}
              >
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail (não editável)</Label>
                  <Input id="email" value={email} disabled />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cpf">CPF (não editável)</Label>
                  <Input id="cpf" value="Protegido pela conta" disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Nome completo</Label>
                  <Input {...profileForm.register('nomeCompleto')} />
                </div>
                <div className="grid gap-2">
                  <Label>Nome de exibição</Label>
                  <Input {...profileForm.register('displayName')} />
                </div>
                <div className="grid gap-2">
                  <Label>Nome de usuário</Label>
                  <Input {...profileForm.register('username')} />
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label>Data de nascimento</Label>
                    <Input type="date" {...profileForm.register('dataNascimento')} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Peso (kg)</Label>
                    <Input type="number" {...profileForm.register('peso', { valueAsNumber: true })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Altura (cm)</Label>
                    <Input type="number" {...profileForm.register('altura', { valueAsNumber: true })} />
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Foto de perfil (URL)</Label>
                    <Input placeholder="https://..." {...profileForm.register('avatarUrl')} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Plano de fundo (URL)</Label>
                    <Input placeholder="https://..." {...profileForm.register('backgroundUrl')} />
                  </div>
                </div>
                <Button type="submit">Salvar perfil</Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>Escolha canais e frequência de alertas.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4"
              onSubmit={notificationForm.handleSubmit((values) =>
                void onSaveNotifications(values),
              )}
            >
              <div className="flex items-center justify-between">
                <Label>Notificações no app</Label>
                <Switch
                  checked={notificationForm.watch('app')}
                  onCheckedChange={(value) => notificationForm.setValue('app', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Notificações por e-mail</Label>
                <Switch
                  checked={notificationForm.watch('email')}
                  onCheckedChange={(value) => notificationForm.setValue('email', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Notificações por WhatsApp</Label>
                <Switch
                  checked={notificationForm.watch('whatsapp')}
                  onCheckedChange={(value) => notificationForm.setValue('whatsapp', value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Frequência</Label>
                <Select
                  value={notificationForm.watch('frequency')}
                  onValueChange={(value) =>
                    notificationForm.setValue(
                      'frequency',
                      value as NotificationPreferencesValues['frequency'],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Imediata</SelectItem>
                    <SelectItem value="daily">Diária</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" variant="outline">
                Salvar notificações
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conformidade legal</CardTitle>
            <CardDescription>Registro de aceite de Termos e Política de Privacidade.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void onAcceptLegal()} variant="secondary">
                Registrar aceite atual
              </Button>
              <Button asChild variant="outline">
                <Link href="/seguranca">Segurança da conta</Link>
              </Button>
              <Button asChild variant="destructive">
                <Link href="/conta/excluir">Excluir conta</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <MobileBottomNav />
    </AuthenticatedShell>
  )
}
