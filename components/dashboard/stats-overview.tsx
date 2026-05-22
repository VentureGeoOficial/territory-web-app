import {
  Activity,
  Clock,
  Footprints,
  Gauge,
  MapPinned,
  Route,
} from 'lucide-react'
import { DashboardCard } from '@/components/dashboard/dashboard-card'
import { formatArea, formatDistance, formatDuration } from '@/lib/territory/geo'
import { formatSpeedKmh } from '@/lib/dashboard/aggregate-runs'
import type { DashboardMetrics } from '@/lib/dashboard/types'

interface StatsOverviewProps {
  metrics: DashboardMetrics
}

export function StatsOverview({ metrics }: StatsOverviewProps) {
  return (
    <section className="space-y-4 animate-in fade-in duration-500" aria-labelledby="stats-overview-heading">
      <h2 id="stats-overview-heading" className="text-lg font-semibold text-foreground">
        Resumo geral
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <DashboardCard
          label="Distância total"
          value={formatDistance(metrics.totalDistanceM)}
          icon={Route}
        />
        <DashboardCard
          label="Tempo em movimento"
          value={formatDuration(metrics.totalDurationSeconds)}
          icon={Clock}
        />
        <DashboardCard
          label="Percursos"
          value={String(metrics.runCount)}
          hint="Atividades concluídas"
          icon={Activity}
        />
        <DashboardCard
          label="Velocidade média"
          value={formatSpeedKmh(metrics.avgSpeedMps)}
          icon={Gauge}
        />
        <DashboardCard
          label="Territórios dominados"
          value={String(metrics.territoriesCount)}
          icon={MapPinned}
        />
        <DashboardCard
          label="Área conquistada"
          value={formatArea(metrics.totalAreaM2)}
          icon={MapPinned}
        />
        <DashboardCard
          label="Passos estimados"
          value={metrics.estimatedSteps.toLocaleString('pt-BR')}
          hint="Baseado na distância (~0,75 m/passo)"
          icon={Footprints}
        />
        <DashboardCard
          label="Sequência ativa"
          value={`${metrics.activeDaysStreak} dia${metrics.activeDaysStreak !== 1 ? 's' : ''}`}
          hint="Dias consecutivos com atividade"
          icon={Activity}
        />
      </div>
    </section>
  )
}
