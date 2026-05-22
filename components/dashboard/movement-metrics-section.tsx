import { Footprints, Gauge, Timer } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistance, formatDuration } from '@/lib/territory/geo'
import { formatPace, formatSpeedKmh } from '@/lib/dashboard/aggregate-runs'
import type { DashboardMetrics } from '@/lib/dashboard/types'

interface MovementMetricsSectionProps {
  metrics: DashboardMetrics
}

export function MovementMetricsSection({ metrics }: MovementMetricsSectionProps) {
  return (
    <section className="space-y-4 animate-in fade-in duration-500 delay-150" aria-labelledby="movement-heading">
      <h2 id="movement-heading" className="text-lg font-semibold text-foreground">
        Métricas de movimento
      </h2>
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Ritmo e deslocamento</CardTitle>
          <CardDescription>
            Dados agregados dos seus percursos. Passos são estimados; tempo parado e calorias não
            estão disponíveis nesta versão.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Distância total</p>
            <p className="text-xl font-mono font-semibold">{formatDistance(metrics.totalDistanceM)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tempo caminhando/correndo</p>
            <p className="text-xl font-mono font-semibold">
              {formatDuration(metrics.totalDurationSeconds)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" aria-hidden />
              Ritmo médio
            </p>
            <p className="text-xl font-mono font-semibold">{formatPace(metrics.avgPaceMinPerKm)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Footprints className="h-3.5 w-3.5" aria-hidden />
              Passos (estimados)
            </p>
            <p className="text-xl font-mono font-semibold">
              {metrics.estimatedSteps.toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Timer className="h-3.5 w-3.5" aria-hidden />
              Velocidade média
            </p>
            <p className="text-xl font-mono font-semibold">{formatSpeedKmh(metrics.avgSpeedMps)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Frequência (4 semanas)</p>
            <p className="text-xl font-mono font-semibold">
              {metrics.activityFrequencyPerWeek.toFixed(1)} /sem
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
