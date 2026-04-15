'use client'

import * as React from 'react'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { useAuthStore } from '@/lib/store/auth-store'
import { useTerritoryStore } from '@/lib/store/territory-store'
import { useFriendsCount } from '@/hooks/use-friends-count'
import { computeTrophyProgress } from '@/lib/gamification/trophies'
import { AuthenticatedShell } from '@/components/layout/authenticated-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrophiesListSkeleton } from '@/components/ui/skeletons'
import { Flame, Map, Star, Trophy, Users } from 'lucide-react'

const iconMap = {
  map: Map,
  trophy: Trophy,
  flame: Flame,
  users: Users,
  star: Star,
}

export default function TrofeusPage() {
  const currentUserId = useTerritoryStore((s) => s.currentUserId)
  const territories = useTerritoryStore((s) => s.territories)
  const getTotalAreaForUser = useTerritoryStore((s) => s.getTotalAreaForUser)
  const friendsCount = useFriendsCount()
  
  // Memoize filtered territories to avoid infinite loop
  const myTerritories = React.useMemo(
    () => territories.filter((t) => t.userId === currentUserId),
    [territories, currentUserId]
  )
  const user = useAuthStore((s) => s.user)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const totalArea = getTotalAreaForUser(currentUserId)
  const fc = isFirebaseConfigured() ? friendsCount : 0

  const trophies = computeTrophyProgress({
    territoriesCount: myTerritories.length,
    totalAreaM2: totalArea,
    friendsCount: fc,
  })

  const unlocked = trophies.filter((t) => t.unlocked).length

  return (
    <AuthenticatedShell>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Troféus</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Conquistas desbloqueáveis com base na sua área, territórios e rede social.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {user?.displayName} — {unlocked}/{trophies.length} desbloqueados
            {!isFirebaseConfigured() && (
              <span> (amigos social só contam com Firebase)</span>
            )}
          </p>
        </div>

        {isLoading ? (
          <TrophiesListSkeleton count={5} />
        ) : (
          <div className="grid gap-4">
            {trophies.map((t) => {
              const Icon = iconMap[t.definition.icon]
              return (
                <Card
                  key={t.definition.id}
                  className={t.unlocked ? 'border-primary/40' : 'opacity-90'}
                >
                  <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        t.unlocked ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <CardTitle className="text-base leading-tight">
                        {t.definition.title}
                      </CardTitle>
                      <CardDescription>{t.definition.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!t.unlocked && t.target > 1 && (
                      <div className="space-y-1">
                        <Progress
                          value={Math.min(100, (t.progress / t.target) * 100)}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {Math.round(t.progress)} / {t.target}
                        </p>
                      </div>
                    )}
                    {t.unlocked && (
                      <p className="text-xs font-medium text-primary">Desbloqueado</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AuthenticatedShell>
  )
}
