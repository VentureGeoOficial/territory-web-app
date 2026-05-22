import { MapPinned, Trophy } from 'lucide-react'
import { DashboardCard } from '@/components/dashboard/dashboard-card'
import { formatArea } from '@/lib/territory/geo'
import type { DashboardMetrics } from '@/lib/dashboard/types'

interface TerritoryStatsProps {
  metrics: DashboardMetrics
}

export function TerritoryStats({ metrics }: TerritoryStatsProps) {
  return (
    <section className="space-y-4 animate-in fade-in duration-500 delay-75" aria-labelledby="territory-stats-heading">
      <h2 id="territory-stats-heading" className="text-lg font-semibold text-foreground">
        Domínio territorial
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardCard
          label="Territórios"
          value={String(metrics.territoriesCount)}
          hint="Polígonos conquistados no mapa"
          icon={Trophy}
        />
        <DashboardCard
          label="Área total"
          value={formatArea(metrics.totalAreaM2)}
          hint="Soma da área dominada"
          icon={MapPinned}
        />
      </div>
    </section>
  )
}
