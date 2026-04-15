'use client'

import * as React from 'react'
import Link from 'next/link'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { useAuthStore } from '@/lib/store/auth-store'
import { useTerritoryStore } from '@/lib/store/territory-store'
import { formatArea } from '@/lib/territory/geo'
import { useLeaderboardPreview } from '@/hooks/use-leaderboard-preview'
import { useFriendsCount } from '@/hooks/use-friends-count'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { VentureGeoBrandLogo } from '@/components/brand/venture-geo-logo'
import {
  ArrowRight,
  Map,
  Medal,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'

export function AuthenticatedDashboard() {
  const user = useAuthStore((s) => s.user)
  const currentUserId = useTerritoryStore((s) => s.currentUserId)
  const territories = useTerritoryStore((s) => s.territories)
  const initMockData = useTerritoryStore((s) => s.initMockData)
  const getTotalAreaForUser = useTerritoryStore((s) => s.getTotalAreaForUser)

  React.useEffect(() => {
    if (isFirebaseConfigured()) return
    if (territories.length === 0) initMockData()
  }, [territories.length, initMockData])
  
  // Memoize filtered territories to avoid infinite loop
  const myTerritories = React.useMemo(
    () => territories.filter((t) => t.userId === currentUserId),
    [territories, currentUserId]
  )
  
  const leaderboard = useLeaderboardPreview(6)
  const friendsCount = useFriendsCount()

  const myArea = getTotalAreaForUser(currentUserId)
  const myRank =
    leaderboard.findIndex((e) => e.userId === currentUserId) + 1 || '—'

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <VentureGeoBrandLogo height={44} />
            <div>
              <p className="text-xs text-muted-foreground">Olá,</p>
              <p className="font-semibold text-foreground">
                {user?.displayName ?? 'Corredor'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link href="/mapa">
                <Map className="h-4 w-4 mr-1" />
                Mapa
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/competicao">
                <Medal className="h-4 w-4 mr-1" />
                Competição
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/amigos">
                <Users className="h-4 w-4 mr-1" />
                Amigos
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/trofeus">
                <Trophy className="h-4 w-4 mr-1" />
                Troféus
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-2 text-sm text-primary">
          <Zap className="h-4 w-4" />
          <span>Resumo da sua atividade</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Área conquistada</CardDescription>
              <CardTitle className="text-2xl font-mono">{formatArea(myArea)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Territórios</CardDescription>
              <CardTitle className="text-2xl font-mono">{myTerritories.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Posição no ranking</CardDescription>
              <CardTitle className="text-2xl font-mono">
                {typeof myRank === 'number' ? `#${myRank}` : myRank}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Amigos</CardDescription>
              <CardTitle className="text-2xl font-mono">{friendsCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ranking (prévia)</CardTitle>
                <CardDescription>
                  Ordenado por área total dominada
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/competicao" className="gap-1">
                  Ver tudo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Ainda não há dados de ranking. Conquiste territórios no mapa.
                </p>
              ) : (
                <ul className="space-y-2">
                  {leaderboard.map((row) => (
                    <li
                      key={row.userId}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className="font-mono text-muted-foreground w-6"
                        >
                          #{row.rank}
                        </span>
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ background: row.userColor }}
                        />
                        <span
                          className={
                            row.userId === currentUserId
                              ? 'font-semibold text-primary'
                              : ''
                          }
                        >
                          {row.userName}
                        </span>
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {formatArea(row.totalAreaM2)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atalhos</CardTitle>
              <CardDescription>Acesso rápido às áreas do app</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild className="justify-start" variant="outline">
                <Link href="/mapa">
                  <Map className="h-4 w-4 mr-2" />
                  Desenhar território
                </Link>
              </Button>
              <Button asChild className="justify-start" variant="outline">
                <Link href="/competicao">
                  <Medal className="h-4 w-4 mr-2" />
                  Ranking global e amigos
                </Link>
              </Button>
              <Button asChild className="justify-start" variant="outline">
                <Link href="/amigos">
                  <Users className="h-4 w-4 mr-2" />
                  Rivais e recordes
                </Link>
              </Button>
              <Button asChild className="justify-start" variant="outline">
                <Link href="/trofeus">
                  <Trophy className="h-4 w-4 mr-2" />
                  Conquistas e badges
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
