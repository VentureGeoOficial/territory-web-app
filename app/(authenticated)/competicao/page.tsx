'use client'

import * as React from 'react'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { subscribeAcceptedFriends } from '@/lib/firebase/friends'
import { useAuthStore } from '@/lib/store/auth-store'
import { useGlobalLeaderboard } from '@/hooks/use-global-leaderboard'
import { AuthenticatedShell } from '@/components/layout/authenticated-shell'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RankingListSkeleton } from '@/components/ui/skeletons'
import { formatArea } from '@/lib/territory/geo'
import type { RankingEntry } from '@/lib/territory/types'

export default function CompeticaoPage() {
  const uid = useAuthStore((s) => s.user?.id)
  const global = useGlobalLeaderboard(50)
  const [friendIds, setFriendIds] = React.useState<string[]>([])

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

  return (
    <AuthenticatedShell>
      <div className="space-y-6 pb-16 lg:pb-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Competição</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Compare a área dominada com os seus amigos em Suzano.
          </p>
        </div>

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="friends">Amigos</TabsTrigger>
            <TabsTrigger value="global">Global</TabsTrigger>
          </TabsList>
          <TabsContent value="friends">
            {!isFirebaseConfigured() && (
              <p className="text-xs text-amber-500 mb-2">
                Configure o Firebase para ver o ranking entre amigos.
              </p>
            )}
            {isFirebaseConfigured() && friendIds.length === 0 && (
              <p className="text-xs text-muted-foreground mb-2">
                Adicione amigos na página Amigos para ver o ranking do seu círculo.
              </p>
            )}
            <LeaderboardCard
              entries={friendsOnly}
              currentUserId={uid ?? ''}
              isLoading={false}
            />
          </TabsContent>
          <TabsContent value="global">
            <Card>
              <CardHeader>
                <CardTitle>Em breve</CardTitle>
                <CardDescription>
                  O ranking global será disponibilizado numa atualização futura.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Por agora, compete apenas com o seu círculo de amigos na aba Amigos.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <MobileBottomNav />
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
