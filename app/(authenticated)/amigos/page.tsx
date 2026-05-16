'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import type { PublicProfileSnapshotData } from '@/lib/firebase/user-profile'
import {
  acceptFriendRequest,
  cancelFriendRequest,
  FRIEND_USERNAME_SLUG_PATTERN,
  lookupFriendUid,
  rejectFriendRequest,
  sendFriendRequest,
  subscribeFriendRequests,
  validateNoExistingFriendship,
  type FriendRequestDoc,
} from '@/lib/services/friends-service'
import { useAuthStore } from '@/lib/store/auth-store'
import { AuthenticatedShell } from '@/components/layout/authenticated-shell'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FriendsListSkeleton } from '@/components/ui/skeletons'
import { formatArea } from '@/lib/territory/geo'
import { useRateLimit } from '@/hooks/use-rate-limit'
import { useFriendIds } from '@/hooks/use-friend-ids'
import { useFriendProfiles } from '@/hooks/use-friend-profiles'

function formatPublicLabel(
  uid: string,
  profile: PublicProfileSnapshotData | undefined,
): string {
  const name = profile?.displayName?.trim() || 'Corredor'
  const slug = profile?.username?.trim()
  return slug ? `${name} (@${slug})` : `${name} · ${uid.slice(0, 6)}…`
}

export default function AmigosPage() {
  const uid = useAuthStore((s) => s.user?.id)

  const [usernameInput, setUsernameInput] = React.useState('')
  const [incoming, setIncoming] = React.useState<FriendRequestDoc[]>([])
  const [outgoing, setOutgoing] = React.useState<FriendRequestDoc[]>([])
  const friendIds = useFriendIds()

  const profileUids = React.useMemo(() => {
    const s = new Set<string>()
    friendIds.forEach((id) => s.add(id))
    incoming.forEach((r) => s.add(r.fromUserId))
    outgoing.forEach((r) => s.add(r.toUserId))
    return [...s]
  }, [friendIds, incoming, outgoing])

  const profileMap = useFriendProfiles(profileUids)

  const sortedIncoming = React.useMemo(
    () => [...incoming].sort((a, b) => b.createdAt - a.createdAt),
    [incoming],
  )

  const { canExecute, recordExecution, isLimited } = useRateLimit({
    minInterval: 2000,
    maxAttempts: 3,
    windowMs: 60000,
  })

  React.useEffect(() => {
    if (!uid || !isFirebaseConfigured()) return
    const unsub = subscribeFriendRequests(uid, (inc, out) => {
      setIncoming(inc)
      setOutgoing(out)
    })
    return () => unsub?.()
  }, [uid])

  async function handleSendRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!uid || !usernameInput.trim()) return

    const slug = usernameInput.trim().replace(/^@/, '').toLowerCase()
    if (!FRIEND_USERNAME_SLUG_PATTERN.test(slug)) {
      toast.error(
        'Username inválido. Use 3–30 caracteres (a-z, 0-9 ou _), sem espaços.',
      )
      return
    }

    if (!canExecute()) {
      toast.error('Muitos pedidos enviados. Aguarde um momento.')
      return
    }

    recordExecution()

    try {
      const lookup = await lookupFriendUid({ username: slug })
      if (lookup.kind === 'error') {
        if (lookup.code === 'firebase_not_configured') {
          toast.error('Firebase não está configurado neste ambiente.')
          return
        }
        toast.error('Não foi possível procurar o utilizador. Tente novamente.')
        return
      }
      if (lookup.kind === 'not_found') {
        toast.error(
          'Utilizador não encontrado. Verifique se o nome de usuário está correto — é o mesmo definido no registo.',
        )
        return
      }

      const pre = validateNoExistingFriendship({
        uid,
        targetUid: lookup.uid,
        friendIds,
        incoming,
        outgoing,
      })
      if (!pre.ok) {
        if (pre.reason === 'self') {
          toast.error('Não pode enviar pedido a si mesmo.')
          return
        }
        if (pre.reason === 'already_friend') {
          toast.error('Já é amigo deste utilizador.')
          return
        }
        if (pre.reason === 'pending_outgoing') {
          toast.error('Já existe um pedido pendente para este utilizador.')
          return
        }
        if (pre.reason === 'pending_incoming') {
          toast.error(
            'Este utilizador já lhe enviou um pedido. Aceite-o na secção «Pedidos recebidos».',
          )
          return
        }
      }

      await sendFriendRequest(uid, lookup.uid)
      toast.success('Pedido enviado.')
      setUsernameInput('')
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      if (msg === 'DUPLICATE_REQUEST') {
        toast.error(
          'Já existe pedido pendente ou amizade com este utilizador. Atualize a página.',
        )
        return
      }
      toast.error('Não foi possível enviar o pedido.')
    }
  }

  const isLoadingFriends =
    isFirebaseConfigured() &&
    friendIds.length > 0 &&
    friendIds.some((id) => !profileMap.has(id))

  return (
    <AuthenticatedShell>
      <div className="space-y-8 max-w-2xl pb-16 lg:pb-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Amigos e rivais</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Compare área dominada e acompanhe o seu círculo.
          </p>
        </div>

        {!isFirebaseConfigured() && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Firebase necessário</CardTitle>
              <CardDescription>
                Defina NEXT_PUBLIC_FIREBASE_* nas variáveis de ambiente (painel Vercel) para
                usar pedidos de amizade e perfis reais.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {isFirebaseConfigured() && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Adicionar por @username</CardTitle>
                <CardDescription>
                  Introduza o nome público (slug) do utilizador — o mesmo definido no registo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendRequest} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
                      @
                    </span>
                    <Input
                      type="text"
                      autoComplete="username"
                      placeholder="nome_publico"
                      className="pl-8"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={isLimited}>
                    {isLimited ? 'Aguarde...' : 'Enviar pedido'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {sortedIncoming.length > 0 && (
              <Card aria-live="polite">
                <CardHeader>
                  <CardTitle className="text-base">Pedidos recebidos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sortedIncoming.map((r) => {
                    const p = profileMap.get(r.fromUserId)
                    return (
                      <div
                        key={r.id}
                        className="flex items-center justify-between gap-2 border border-border rounded-lg px-3 py-2 text-sm"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-8 w-8 rounded-full shrink-0 border border-border"
                            style={{
                              backgroundColor: p?.color ?? 'hsl(var(--muted))',
                            }}
                            title={formatPublicLabel(r.fromUserId, p)}
                          />
                          <span className="truncate">
                            Pedido de{' '}
                            <span className="font-medium">
                              {formatPublicLabel(r.fromUserId, p)}
                            </span>
                          </span>
                        </span>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => {
                              void acceptFriendRequest(r.id).then(() =>
                                toast.success('Pedido aceite.'),
                              )
                            }}
                          >
                            Aceitar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              void rejectFriendRequest(r.id)
                            }}
                          >
                            Recusar
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {outgoing.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pedidos enviados</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    {outgoing.map((r) => {
                      const p = profileMap.get(r.toUserId)
                      return (
                        <li
                          key={r.id}
                          className="flex items-center justify-between gap-2 border border-border rounded-lg px-3 py-2"
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <span
                              className="h-8 w-8 rounded-full shrink-0 border border-border"
                              style={{
                                backgroundColor: p?.color ?? 'hsl(var(--muted))',
                              }}
                            />
                            <span className="truncate text-foreground">
                              Pendente →{' '}
                              <span className="font-medium">
                                {formatPublicLabel(r.toUserId, p)}
                              </span>
                            </span>
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            className="shrink-0"
                            onClick={() => {
                              void cancelFriendRequest(r.id).then(() =>
                                toast.success('Pedido cancelado.'),
                              )
                            }}
                          >
                            Cancelar
                          </Button>
                        </li>
                      )
                    })}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Amigos</CardTitle>
                <CardDescription>Área total registrada no perfil (Firestore).</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingFriends ? (
                  <FriendsListSkeleton count={3} />
                ) : friendIds.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum amigo ainda.</p>
                ) : (
                  <ul className="space-y-2">
                    {friendIds.map((fid) => {
                      const p = profileMap.get(fid)
                      const area = Number(p?.totalAreaM2 ?? 0)
                      return (
                        <li
                          key={fid}
                          className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            {p?.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.avatarUrl}
                                alt=""
                                className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
                              />
                            ) : (
                              <span
                                className="h-9 w-9 rounded-full shrink-0 border border-border flex items-center justify-center text-xs font-semibold text-background"
                                style={{
                                  backgroundColor: p?.color ?? 'hsl(var(--muted-foreground))',
                                }}
                              >
                                {(p?.displayName ?? '?').slice(0, 1).toUpperCase()}
                              </span>
                            )}
                            <span className="truncate font-medium">
                              {formatPublicLabel(fid, p)}
                            </span>
                          </span>
                          <span className="font-mono text-muted-foreground shrink-0">
                            {formatArea(area)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
      <MobileBottomNav />
    </AuthenticatedShell>
  )
}
