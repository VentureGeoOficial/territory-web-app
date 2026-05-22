import { ArrowDown, ArrowUp, Gauge, Timer } from 'lucide-react'
import { DashboardCard } from '@/components/dashboard/dashboard-card'
import { formatDistance, formatDuration } from '@/lib/territory/geo'
import { formatSpeedKmh } from '@/lib/dashboard/aggregate-runs'
import type { DashboardMetrics } from '@/lib/dashboard/types'

interface RouteStatsSectionProps {
  metrics: DashboardMetrics
}

export function RouteStatsSection({ metrics }: RouteStatsSectionProps) {
  if (metrics.runCount === 0) return null

  return (
    <section className="space-y-4 animate-in fade-in duration-500 delay-100" aria-labelledby="route-stats-heading">
      <h2 id="route-stats-heading" className="text-lg font-semibold text-foreground">
        Estatísticas de percurso
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          label="Maior percurso"
          value={formatDistance(metrics.longestRunM)}
          icon={ArrowUp}
        />
        <DashboardCard
          label="Menor percurso"
          value={formatDistance(metrics.shortestRunM)}
          icon={ArrowDown}
        />
        <DashboardCard
          label="Média de distância"
          value={formatDistance(metrics.avgDistanceM)}
          icon={ArrowUp}
        />
        <DashboardCard
          label="Média de tempo"
          value={formatDuration(Math.round(metrics.avgDurationSeconds))}
          icon={Timer}
        />
        <DashboardCard
          label="Velocidade máxima (média do trecho)"
          value={formatSpeedKmh(metrics.maxAvgSpeedMps)}
          icon={Gauge}
        />
        <DashboardCard
          label="Tempo ativo total"
          value={formatDuration(metrics.totalDurationSeconds)}
          icon={Timer}
        />
      </div>
    </section>
  )
}
