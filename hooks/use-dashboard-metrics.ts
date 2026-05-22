'use client'

import * as React from 'react'
import { aggregateDashboardMetrics } from '@/lib/dashboard/aggregate-runs'
import type { DashboardMetrics, ProfileAggregates, RunRecord } from '@/lib/dashboard/types'
import { EMPTY_DASHBOARD_METRICS } from '@/lib/dashboard/types'
import { subscribeUserRuns } from '@/lib/firebase/dashboard-runs'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { useTerritoryStore } from '@/lib/store/territory-store'

const RECENT_RUNS_LIMIT = 10

export interface UseDashboardMetricsResult {
  metrics: DashboardMetrics
  recentRuns: RunRecord[]
  isLoading: boolean
  error: string | null
}

export function useDashboardMetrics(userId: string | undefined): UseDashboardMetricsResult {
  const users = useTerritoryStore((s) => s.users)
  const currentUserId = useTerritoryStore((s) => s.currentUserId)

  const [runs, setRuns] = React.useState<RunRecord[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const uid = userId ?? currentUserId
  const profileUser = users.find((u) => u.id === uid)

  const profile: ProfileAggregates = React.useMemo(
    () => ({
      totalDistanceM: Number(profileUser?.totalDistanceM ?? 0),
      totalDurationSeconds: Number(profileUser?.totalDurationSeconds ?? 0),
      territoriesCount: Number(profileUser?.territoriesCount ?? 0),
      totalAreaM2: Number(profileUser?.totalAreaM2 ?? 0),
    }),
    [profileUser],
  )

  React.useEffect(() => {
    if (!uid) {
      setIsLoading(false)
      return
    }

    if (!isFirebaseConfigured()) {
      setRuns([])
      setError('Configure o Firebase para ver estatísticas e histórico de percursos.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const unsub = subscribeUserRuns(
      uid,
      (data) => {
        setRuns(data)
        setIsLoading(false)
      },
      (err) => {
        setError(err.message || 'Não foi possível carregar o histórico.')
        setIsLoading(false)
      },
    )

    return () => {
      unsub?.()
    }
  }, [uid])

  const metrics = React.useMemo(
    () => aggregateDashboardMetrics(runs, profile),
    [runs, profile],
  )

  const recentRuns = React.useMemo(() => runs.slice(0, RECENT_RUNS_LIMIT), [runs])

  return {
    metrics: isLoading && runs.length === 0 ? EMPTY_DASHBOARD_METRICS : metrics,
    recentRuns,
    isLoading,
    error,
  }
}
