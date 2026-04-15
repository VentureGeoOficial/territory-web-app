'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import {
  acceptFriendRequest,
  findUserIdByEmail,
  rejectFriendRequest,
  sendFriendRequest,
  subscribeAcceptedFriends,
  subscribeFriendRequests,
  type FriendRequestDoc,
} from '@/lib/firebase/friends'
import { getUserProfile } from '@/lib/firebase/user-profile'
import { useAuthStore } from '@/lib/store/auth-store'
import { useTerritoryStore } from '@/lib/store/territory-store'
import { AuthenticatedShell } from '@/components/layout/authenticated-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FriendsListSkeleton } from '@/components/ui/skeletons'
import { formatArea } from '@/lib/territory/geo'
import { useRateLimit } from '@/hooks/use-rate-limit'
import { User } from 'lucide-react'

export default function AmigosPage() {
  const uid = useAuthStore((s) => s.user?.id)
  const currentUserId = useTerritoryStore((s) => s.currentUserId)
  const users = useTerritoryStore((s) => s.users)
  const getTotalAreaForUser = useTerritoryStore((s) => s.getTotalAreaForUser)

  const [email, setEmail] = React.useState('')
  const [incoming, setIncoming] = React.useState<FriendRequestDoc[]>([])
  const [outgoing, setOutgoing] = React.useState<FriendRequestDoc[]>([])
  const [friendIds, setFriendIds] = React.useState<string[]>([])
  const [friendProfiles, setFriendProfiles] = React.useState<
    { id: string; displayName: string; totalAreaM2: number }[]
  >([])
  const [isLoadingFriends, setIsLoadingFriends] = React.useState(true)
  
  // Rate limit para envio de pedidos: max 3 por minuto
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

  React.useEffect(() => {
    if (!uid || !isFirebaseConfigured()) return
    const unsub = subscribeAcceptedFriends(uid, setFriendIds)
    return () => unsub?.()
  }, [uid])

  React.useEffect(() => {
    if (!isFirebaseConfigured() || friendIds.length === 0) {
      setFriendProfiles([])
      setIsLoadingFriends(false)
      return
    }
    setIsLoadingFriends(true)
    let cancelled = false
    void (async () => {
      const rows: { id: string; displayName: string; totalAreaM2: number }[] = []
      for (const id of friendIds) {
        const p = await getUserProfile(id)
        if (p)
          rows.push({
            id,
            displayName: p.displayName,
            totalAreaM2: p.totalAreaM2,
          })
      }
      if (!cancelled) {
        setFriendProfiles(rows)
        setIsLoadingFriends(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [friendIds])

  async function handleSendRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!uid || !email.trim()) return
    
    if (!canExecute()) {
      toast.error('Muitos pedidos enviados. Aguarde um momento.')
      return
    }
    
    recordExecution()
    
    try {
      const target = await findUserIdByEmail(email.trim())
      if (!target) {
        toast.error('Nenhum utilizador encontrado com esse e-mail.')
        return
      }
      await sendFriendRequest(uid, target)
      toast.success('Pedido enviado.')
      setEmail('')
    } catch {
      toast.error('Não foi possível enviar o pedido.')
    }
  }

  const mockRivals = users.filter((u) => u.id !== currentUserId)

  return (
    <AuthenticatedShell>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Amigos e rivais</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Compare área dominada e acompanhe o seu círculo.
          </p>
        </div>

        {!isFirebaseConfigured() && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Modo demo (sem Firebase)</CardTitle>
              <CardDescription>
                Perfis abaixo vêm do mapa de demonstração. Configure Firebase para pedidos
                e amigos reais.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mockRivals.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {u.displayName}
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {formatArea(getTotalAreaForUser(u.id))}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {isFirebaseConfigured() && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Adicionar por e-mail</CardTitle>
                <CardDescription>
                  O utilizador precisa ter conta no TerritoryRun com o mesmo e-mail.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendRequest} className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="email"
                    placeholder="amigo@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button type="submit" disabled={isLimited}>
                    {isLimited ? 'Aguarde...' : 'Enviar pedido'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {incoming.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pedidos recebidos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {incoming.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-2 border border-border rounded-lg px-3 py-2 text-sm"
                    >
                      <span>Pedido de {r.fromUserId.slice(0, 8)}…</span>
                      <div className="flex gap-2">
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
                  ))}
                </CardContent>
              </Card>
            )}

            {outgoing.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pedidos enviados</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {outgoing.map((r) => (
                      <li key={r.id}>Pendente → {r.toUserId.slice(0, 8)}…</li>
                    ))}
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
                ) : friendProfiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum amigo ainda.</p>
                ) : (
                  <ul className="space-y-2">
                    {friendProfiles.map((f) => (
                      <li
                        key={f.id}
                        className="flex justify-between rounded-lg border border-border px-3 py-2 text-sm"
                      >
                        <span>{f.displayName}</span>
                        <span className="font-mono text-muted-foreground">
                          {formatArea(f.totalAreaM2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AuthenticatedShell>
  )
}
