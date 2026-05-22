'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { formatDistance, formatDuration } from '@/lib/territory/geo'
import type { RunRecord } from '@/lib/dashboard/types'
import { cn } from '@/lib/utils'

interface ActivityCardProps {
  run: RunRecord
  className?: string
}

function formatRunDate(ts: number): string {
  return new Date(ts).toLocaleString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ActivityCardComponent({ run, className }: ActivityCardProps) {
  const dateLabel = formatRunDate(run.endedAt)
  const speed =
    run.durationSeconds > 0 ? (run.distanceMeters / run.durationSeconds) * 3.6 : 0

  return (
    <article
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-border px-4 py-3 text-sm transition-colors hover:border-primary/25 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <time className="text-xs text-muted-foreground" dateTime={new Date(run.endedAt).toISOString()}>
          {dateLabel}
        </time>
        <p className="font-medium text-foreground">
          {formatDistance(run.distanceMeters)} · {formatDuration(run.durationSeconds)}
        </p>
        {speed > 0 && (
          <p className="text-xs text-muted-foreground">{speed.toFixed(1)} km/h em média</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {run.xpGained > 0 && (
          <Badge variant="secondary" className="font-mono text-[10px]">
            +{run.xpGained} XP
          </Badge>
        )}
        {run.areaM2 > 0 && (
          <Badge variant="outline" className="text-[10px]">
            Território
          </Badge>
        )}
      </div>
    </article>
  )
}

export const ActivityCard = React.memo(ActivityCardComponent)
