import { ActivityCard } from '@/components/dashboard/activity-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { RunRecord } from '@/lib/dashboard/types'

interface ActivityTimelineProps {
  recentRuns: RunRecord[]
}

export function ActivityTimeline({ recentRuns }: ActivityTimelineProps) {
  return (
    <Card className="border-border/60 h-full">
      <CardHeader>
        <CardTitle className="text-base">Últimas atividades</CardTitle>
        <CardDescription>Histórico recente de percursos concluídos</CardDescription>
      </CardHeader>
      <CardContent>
        {recentRuns.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum percurso registrado ainda.
          </p>
        ) : (
          <ul className="space-y-2" aria-label="Lista de atividades recentes">
            {recentRuns.map((run) => (
              <li key={run.id}>
                <ActivityCard run={run} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
