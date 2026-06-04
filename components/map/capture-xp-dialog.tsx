'use client'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { zModal } from '@/lib/layout/z-index'
import { cn } from '@/lib/utils'
import { formatArea } from '@/lib/territory/geo'
import type { CaptureImpactOk } from '@/lib/territory/geoLogic'
import { canAffordCapture, computeXpFromRun } from '@/lib/territory/scoring'

interface CaptureXpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  impact: CaptureImpactOk | null
  distanceMeters: number
  newTerritoryAreaM2: number
  currentXp: number
  onConfirm: () => void | Promise<void>
  loading: boolean
}

export function CaptureXpDialog({
  open,
  onOpenChange,
  impact,
  distanceMeters,
  newTerritoryAreaM2,
  currentXp,
  onConfirm,
  loading,
}: CaptureXpDialogProps) {
  const xpGain = impact ? computeXpFromRun(distanceMeters, newTerritoryAreaM2) : 0
  const xpCost = impact?.xpCost ?? 0
  const xpAfter = currentXp + xpGain - xpCost
  const affordable = impact ? canAffordCapture(currentXp, xpGain, xpCost) : false

  return (
    <AlertDialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <AlertDialogContent
        overlayClassName={cn(zModal)}
        className={cn(zModal, 'border-border bg-card/95 backdrop-blur-md sm:max-w-md')}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="font-mono text-base">
            Conquista inimiga
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              {impact && (
                <>
                  <p>
                    Área sobreposta inimiga:{' '}
                    <span className="font-semibold text-foreground">
                      {formatArea(impact.totalOverlappingAreaM2)}
                    </span>
                  </p>
                  <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2 font-mono text-xs space-y-1.5">
                    <div className="flex justify-between gap-2">
                      <span>Seu XP atual</span>
                      <span className="text-foreground">{currentXp} XP</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span>Custo fixo</span>
                      <span className="text-foreground">10 XP</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span>Variável (m² / 10)</span>
                      <span className="text-foreground">
                        {Math.max(0, xpCost - 10)} XP
                      </span>
                    </div>
                    <div className="flex justify-between gap-2 border-t border-border pt-1.5 text-foreground">
                      <span>Total a debitar</span>
                      <span className="text-[#CCFF00]">{xpCost} XP</span>
                    </div>
                  </div>
                  <p className="text-xs">
                    Ganho desta corrida:{' '}
                    <span className="text-foreground font-medium">+{xpGain} XP</span>
                    {' · '}
                    Saldo após conquista:{' '}
                    <span
                      className={
                        xpAfter >= 0 ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'
                      }
                    >
                      {xpAfter} XP
                    </span>
                  </p>
                  {!affordable && (
                    <p className="text-xs text-amber-400">
                      XP insuficiente para esta conquista. Corra mais ou conquiste áreas
                      menores antes de tentar novamente.
                    </p>
                  )}
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            disabled={loading || !impact || !affordable}
            onClick={() => void onConfirm()}
            className="bg-[#CCFF00] text-[#19305A] hover:bg-[#CCFF00]/90"
          >
            {loading ? 'A processar…' : 'Continuar'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
