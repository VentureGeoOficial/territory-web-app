'use client'

import * as React from 'react'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { subscribeAcceptedFriends } from '@/lib/firebase/friends'
import { useAuthStore } from '@/lib/store/auth-store'
import { useGlobalLeaderboard } from '@/hooks/use-global-leaderboard'
import { AuthenticatedShell } from '@/components/layout/authenticated-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RankingListSkeleton } from '@/components/ui/skeletons'
import { formatArea } from '@/lib/territory/geo'
import type { RankingEntry } from '@/lib/territory/types'

export default function CompeticaoPage() {
  const uid = useAuthStore((s) => s.user?.id)
  const global = useGlobalLeaderboard(50)
  const [friendIds, setFriendIds] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    // Simula carregamento inicial para mostrar skeleton
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    if (!uid || !isFirebaseConfigured()) {
      setFriendIds([])
      return
    }
    const unsub = subscribeAcceptedFriends(uid, setFriendIds)
    return () => unsub?.()
  }, [uid])

  const friendsOnly = React.useMemo(() => {
    if (!uid) return [] as RankingEntry[]
    const allow = new Set([uid, ...friendIds])
    const filtered = global.filter((e) => allow.has(e.userId))
    return filtered
      .sort((a, b) => b.totalAreaM2 - a.totalAreaM2)
      .map((e, i) => ({ ...e, rank: i + 1 }))
  }, [global, friendIds, uid])

  const friendsTabData = isFirebaseConfigured() ? friendsOnly : global

  return (
    <AuthenticatedShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Competição</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ranking por área total dominada (m²). Atualização em tempo real com Firebase.
          </p>
        </div>

        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="friends">Amigos</TabsTrigger>
          </TabsList>
          <TabsContent value="global">
            <LeaderboardCard entries={global} currentUserId={uid ?? ''} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="friends">
            {!isFirebaseConfigured() && (
              <p className="text-xs text-muted-foreground mb-2">
                Modo demo: todos os perfis do mapa entram no círculo de comparação.
              </p>
            )}
            {isFirebaseConfigured() && friendIds.length === 0 && !isLoading && (
              <p className="text-xs text-muted-foreground mb-2">
                Adicione amigos em Amigos para ver o ranking do seu círculo.
              </p>
            )}
            <LeaderboardCard entries={friendsTabData} currentUserId={uid ?? ''} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedShell>
  )
}

const LeaderboardCard = React.memo(function LeaderboardCard({
  entries,
  currentUserId,
  isLoading = false,
}: {
  entries: RankingEntry[]
  currentUserId: string
  isLoading?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking</CardTitle>
        <CardDescription>Quanto maior a área acumulada, melhor a posição.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <RankingListSkeleton count={5} />
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Sem dados ainda.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {entries.map((row) => (
              <li
                key={row.userId}
                className="flex items-center justify-between px-4 py-3 text-sm first:rounded-t-lg last:rounded-b-lg"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-muted-foreground w-8 shrink-0">
                    #{row.rank}
                  </span>
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: row.userColor }}
                  />
                  <span
                    className={`truncate ${row.userId === currentUserId ? 'font-semibold text-primary' : ''}`}
                  >
                    {row.userName}
                  </span>
                </span>
                <span className="font-mono text-muted-foreground shrink-0 ml-2">
                  {formatArea(row.totalAreaM2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
})
