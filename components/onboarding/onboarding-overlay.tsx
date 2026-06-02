'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { zModal } from '@/lib/layout/z-index'
import type { OnboardingStepConfig } from '@/lib/onboarding/onboarding-steps'

type SpotlightRect = {
  top: number
  left: number
  width: number
  height: number
}

interface OnboardingOverlayProps {
  open: boolean
  stepIndex: number
  step: OnboardingStepConfig
  totalSteps: number
  onBack: () => void
  onNext: () => void
  onSkip: () => void
  finishing?: boolean
}

function measureTarget(selector?: string): SpotlightRect | null {
  if (!selector || typeof document === 'undefined') return null
  const el = document.querySelector(selector)
  if (!el) return null
  const r = el.getBoundingClientRect()
  const pad = 8
  return {
    top: Math.max(0, r.top - pad),
    left: Math.max(0, r.left - pad),
    width: r.width + pad * 2,
    height: r.height + pad * 2,
  }
}

export function OnboardingOverlay({
  open,
  stepIndex,
  step,
  totalSteps,
  onBack,
  onNext,
  onSkip,
  finishing = false,
}: OnboardingOverlayProps) {
  const [spot, setSpot] = React.useState<SpotlightRect | null>(null)
  const isFinish = step.id === 'finish'

  const refreshSpot = React.useCallback(() => {
    setSpot(measureTarget(step.targetSelector))
  }, [step.targetSelector])

  React.useEffect(() => {
    if (!open) return
    refreshSpot()
    const t1 = window.setTimeout(refreshSpot, 350)
    const onResize = () => refreshSpot()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    return () => {
      window.clearTimeout(t1)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
    }
  }, [open, refreshSpot, stepIndex])

  if (!open) return null

  return (
    <div
      className={cn('fixed inset-0 pointer-events-auto', zModal)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="absolute inset-0 bg-black/65" aria-hidden />

      {spot && !isFinish && (
        <div
          className="absolute rounded-xl ring-2 ring-[#CCFF00] ring-offset-2 ring-offset-transparent pointer-events-none transition-all duration-300"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
          }}
        />
      )}

      <div
        className={cn(
          'absolute left-1/2 z-10 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border p-4 shadow-xl',
          isFinish || !spot ? 'top-1/2 -translate-y-1/2' : 'bottom-[calc(5rem+env(safe-area-inset-bottom))]',
        )}
        style={{
          background: 'rgba(25, 48, 90, 0.98)',
          borderColor: '#2d4a70',
        }}
      >
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
          {stepIndex + 1} / {totalSteps}
        </p>
        <h2 id="onboarding-title" className="text-base font-semibold text-foreground mb-2">
          {step.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {stepIndex > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={onBack} disabled={finishing}>
              Voltar
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            className="ml-auto"
            style={{ background: '#CCFF00', color: '#19305A' }}
            onClick={onNext}
            disabled={finishing}
          >
            {isFinish ? 'Começar' : 'Próximo'}
          </Button>
          {!isFinish && (
            <Button type="button" variant="ghost" size="sm" onClick={onSkip} disabled={finishing}>
              Pular
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
