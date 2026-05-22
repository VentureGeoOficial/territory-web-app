import { Gauge } from 'lucide-react'
import { DashboardCard } from '@/components/dashboard/dashboard-card'
import { formatPace, formatSpeedKmh } from '@/lib/dashboard/aggregate-runs'

interface SpeedWidgetProps {
  avgSpeedMps: number
  maxAvgSpeedMps: number
  avgPaceMinPerKm: number
}

export function SpeedWidget({ avgSpeedMps, maxAvgSpeedMps, avgPaceMinPerKm }: SpeedWidgetProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <DashboardCard label="Velocidade média" value={formatSpeedKmh(avgSpeedMps)} icon={Gauge} />
      <DashboardCard label="Velocidade máxima" value={formatSpeedKmh(maxAvgSpeedMps)} icon={Gauge} />
      <DashboardCard label="Ritmo médio" value={formatPace(avgPaceMinPerKm)} icon={Gauge} />
    </div>
  )
}
