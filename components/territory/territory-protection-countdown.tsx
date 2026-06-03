'use client'

import * as React from 'react'
import { Clock } from 'lucide-react'
import type { TerritoryDisplayKind } from '@/lib/territory/territory-display-status'
import { formatProtectionRemaining } from '@/lib/territory/territory-display-status'

const TICK_MS = 30_000

interface TerritoryProtectionCountdownProps {
  protectedUntil?: number
  displayKind: TerritoryDisplayKind
  className?: string
  /** Variante compacta para cards */
  compact?: boolean
}

export function TerritoryProtectionCountdown({
  protectedUntil,
  displayKind,
  className,
  compact = false,
}: TerritoryProtectionCountdownProps) {
  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    if (displayKind !== 'protected' || protectedUntil === undefined) return
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS)
    return () => window.clearInterval(id)
  }, [displayKind, protectedUntil])

  if (displayKind !== 'protected') return null

  const remaining = formatProtectionRemaining(protectedUntil, now)
  if (!remaining) return null

  if (compact) {
    return (
      <p className={className ?? 'text-[10px] text-muted-foreground flex items-center gap-1 mt-1'}>
        <Clock className="h-3 w-3 shrink-0" aria-hidden />
        <span>
          Proteção restante: <span className="font-medium text-foreground">{remaining}</span>
        </span>
      </p>
    )
  }

  return (
    <div className={className ?? 'flex justify-between items-center'}>
      <span className="text-sm text-muted-foreground">Proteção restante</span>
      <div className="flex items-center gap-1.5 text-sm font-medium text-[#22c55e]">
        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>{remaining}</span>
      </div>
    </div>
  )
}
