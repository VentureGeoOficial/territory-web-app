'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { AuthenticatedShell } from '@/components/layout/authenticated-shell'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { ActivityTimeline } from '@/components/dashboard/activity-timeline'
import { DashboardEmptyState } from '@/components/dashboard/dashboard-empty-state'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DistanceWidget } from '@/components/dashboard/distance-widget'
import { MovementMetricsSection } from '@/components/dashboard/movement-metrics-section'
import { RouteStatsSection } from '@/components/dashboard/route-stats-section'
import { SpeedWidget } from '@/components/dashboard/speed-widget'
import { StatsOverview } from '@/components/dashboard/stats-overview'
import { CardSkeleton, StatsGridSkeleton } from '@/components/ui/skeletons'

const PerformanceChart = dynamic(
  () =>
    import('@/components/dashboard/performance-chart').then((mod) => mod.PerformanceChart),
  {
    ssr: false,
    loading: () => <CardSkeleton />,
  },
)
import { useCurrentUserPublicProfile } from '@/hooks/use-public-profile-sync'
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics'
import { useAuthStore } from '@/lib/store/auth-store'
import { log } from '@/lib/logging/logger'

export default function DashboardPage() {
  const uid = useAuthStore((s) => s.user?.id)
  const displayName = useAuthStore((s) => s.user?.displayName)
  const { metrics, recentRuns, isLoading, error } = useDashboardMetrics(uid)

  useCurrentUserPublicProfile(uid)

  React.useEffect(() => {
    log.info({
      scope: 'DashboardPage',
      event: 'page_view',
      uid,
    })
  }, [uid])

  const showEmpty = !isLoading && metrics.runCount === 0 && !error

  return (
    <AuthenticatedShell>
      <main className="space-y-8 max-w-6xl w-full pb-16">
        <DashboardHeader displayName={displayName} />

        {error && (
          <p className="text-sm text-amber-500 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            {error}
          </p>
        )}

        {isLoading ? (
          <StatsGridSkeleton count={8} />
        ) : showEmpty ? (
          <DashboardEmptyState />
        ) : (
          <>
            <StatsOverview metrics={metrics} />
            <DistanceWidget
              totalDistanceM={metrics.totalDistanceM}
              avgDistanceM={metrics.avgDistanceM}
            />
            <SpeedWidget
              avgSpeedMps={metrics.avgSpeedMps}
              maxAvgSpeedMps={metrics.maxAvgSpeedMps}
              avgPaceMinPerKm={metrics.avgPaceMinPerKm}
            />
            <RouteStatsSection metrics={metrics} />
            <MovementMetricsSection metrics={metrics} />
            <div className="grid gap-6 lg:grid-cols-2">
              <PerformanceChart metrics={metrics} />
              <ActivityTimeline recentRuns={recentRuns} />
            </div>
          </>
        )}
      </main>
      <MobileBottomNav />
    </AuthenticatedShell>
  )
}
