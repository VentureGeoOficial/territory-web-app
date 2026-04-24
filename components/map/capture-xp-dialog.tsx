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
import { formatArea } from '@/lib/territory/geo'
import type { CaptureImpactOk } from '@/lib/territory/geoLogic'
import { computeXpFromRun } from '@/lib/territory/scoring'

interface CaptureXpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  impact: CaptureImpactOk | null
  distanceMeters: number
  newTerritoryAreaM2: number
  onConfirm: () => void | Promise<void>
  loading: boolean
}

export function CaptureXpDialog({
  open,
  onOpenChange,
  impact,
  distanceMeters,
  newTerritoryAreaM2,
  onConfirm,
  loading,
}: CaptureXpDialogProps) {
  const xpGain = impact ? computeXpFromRun(distanceMeters, newTerritoryAreaM2) : 0
  const xpCost = impact?.xpCost ?? 0
  const netXp = xpGain - xpCost

  return (
    <AlertDialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <AlertDialogContent className="border-border bg-card/95 backdrop-blur-md sm:max-w-md">
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
                    Ganho estimado nesta corrida:{' '}
                    <span className="text-foreground font-medium">{xpGain} XP</span>
                    {' · '}
                    Saldo líquido aproximado:{' '}
                    <span
                      className={
                        netXp >= 0 ? 'text-emerald-400' : 'text-amber-400'
                      }
                    >
                      {netXp >= 0 ? '+' : ''}
                      {netXp} XP
                    </span>
                  </p>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            disabled={loading || !impact}
            onClick={() => void onConfirm()}
            className="bg-[#CCFF00] text-[#19305A] hover:bg-[#CCFF00]/90"
          >
            {loading ? 'A processar…' : 'Confirmar conquista'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
