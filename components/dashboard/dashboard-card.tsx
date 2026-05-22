'use client'

import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DashboardCardProps {
  label: string
  value: string
  hint?: string
  icon?: LucideIcon
  className?: string
}

function DashboardCardComponent({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: DashboardCardProps) {
  return (
    <Card
      className={cn(
        'transition-all duration-300 hover:border-primary/30 hover:-translate-y-0.5',
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardDescription>{label}</CardDescription>
          {Icon && (
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10"
              aria-hidden
            >
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
        <CardTitle className="text-2xl font-mono" aria-label={`${label}: ${value}`}>
          {value}
        </CardTitle>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardHeader>
    </Card>
  )
}

export const DashboardCard = React.memo(DashboardCardComponent)
