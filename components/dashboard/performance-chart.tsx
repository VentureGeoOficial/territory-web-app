'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatDistance } from '@/lib/territory/geo'
import type { DashboardMetrics } from '@/lib/dashboard/types'

const chartConfig = {
  distanceM: {
    label: 'Distância',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

interface PerformanceChartProps {
  metrics: DashboardMetrics
}

function formatWeekLabel(weekKey: string): string {
  const d = new Date(weekKey)
  if (Number.isNaN(d.getTime())) return weekKey
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function PerformanceChart({ metrics }: PerformanceChartProps) {
  const data = metrics.weeklyDistance.map((w) => ({
    label: formatWeekLabel(w.weekKey),
    distanceM: Math.round(w.distanceM),
    distanceKm: Number((w.distanceM / 1000).toFixed(2)),
  }))

  return (
    <Card className="border-border/60 animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle className="text-base">Evolução semanal</CardTitle>
        <CardDescription>Distância percorrida por semana (últimas 12 semanas)</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Sem dados suficientes para o gráfico. Complete percursos no mapa.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[220px] w-full aspect-auto">
            <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                tickFormatter={(v) => `${v} m`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatDistance(Number(value))}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="distanceM"
                stroke="var(--color-distanceM)"
                fill="var(--color-distanceM)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
