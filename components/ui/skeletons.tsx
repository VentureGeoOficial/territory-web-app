import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Skeleton para itens de ranking/leaderboard
 */
export function RankingItemSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0">
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-2.5 w-2.5 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

/**
 * Skeleton para lista de ranking completa
 */
export function RankingListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="rounded-lg border border-border">
      {Array.from({ length: count }).map((_, i) => (
        <RankingItemSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton para card de amigo
 */
export function FriendItemSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

/**
 * Skeleton para lista de amigos
 */
export function FriendsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <FriendItemSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton para card de trofeu
 */
export function TrophyCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-12" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton para lista de trofeus
 */
export function TrophiesListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <TrophyCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton para card generico com header
 */
export function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton para stats do dashboard
 */
export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton para grid de stats
 */
export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}
