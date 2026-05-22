import { Route } from 'lucide-react'
import { DashboardCard } from '@/components/dashboard/dashboard-card'
import { formatDistance } from '@/lib/territory/geo'

interface DistanceWidgetProps {
  totalDistanceM: number
  avgDistanceM: number
}

export function DistanceWidget({ totalDistanceM, avgDistanceM }: DistanceWidgetProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <DashboardCard label="Distância acumulada" value={formatDistance(totalDistanceM)} icon={Route} />
      <DashboardCard
        label="Média por percurso"
        value={avgDistanceM > 0 ? formatDistance(avgDistanceM) : '—'}
        icon={Route}
      />
    </div>
  )
}
