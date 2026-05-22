import { ActivityTimeline } from '@/components/dashboard/activity-timeline'
import type { RunRecord } from '@/lib/dashboard/types'

/** Alias semântico para histórico de percursos — mesma timeline de atividades. */
export function RouteHistory({ recentRuns }: { recentRuns: RunRecord[] }) {
  return <ActivityTimeline recentRuns={recentRuns} />
}
