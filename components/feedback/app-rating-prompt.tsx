'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'

import { StarRatingInput } from '@/components/feedback/star-rating-input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { APP_RATING_MAX_COMMENT } from '@/lib/feedback/app-rating-schema'
import { dismissAppRatingPrompt } from '@/lib/feedback/app-rating-prompt-storage'
import { submitAppRating } from '@/lib/feedback/submit-app-rating'
import { trackAppRatingEvent } from '@/lib/feedback/track-app-rating'
import { cn } from '@/lib/utils'

export function AppRatingPrompt({
  hasBottomNav,
  onSubmitted,
  onDismiss,
}: {
  hasBottomNav: boolean
  onSubmitted: () => void
  onDismiss: () => void
}) {
  const revealed = useScrollReveal(220)
  const [stars, setStars] = React.useState(0)
  const [comment, setComment] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  const handleDismiss = () => {
    dismissAppRatingPrompt()
    trackAppRatingEvent('dismissed', 'prompt')
    onDismiss()
  }

  const handleSubmit = async () => {
    if (stars < 1) {
      toast.error('Selecione de 1 a 5 estrelas.')
      return
    }

    setSubmitting(true)
    try {
      await submitAppRating({
        stars,
        comment: comment.trim() || undefined,
      })
      trackAppRatingEvent('submitted', 'prompt', stars)
      toast.success('Obrigado pela avaliação!')
      onSubmitted()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Não foi possível enviar.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 z-[1300] flex justify-center px-4 transition-all duration-500 ease-out',
        hasBottomNav ? 'bottom-[4.75rem]' : 'bottom-4',
        revealed
          ? 'translate-y-0 opacity-100'
          : 'translate-y-3 opacity-0',
      )}
      style={{ zIndex: 1300 }}
      aria-hidden={!revealed}
    >
      <div
        className={cn(
          'pointer-events-auto w-full max-w-md rounded-2xl border border-border/80 bg-card/95 p-4 shadow-xl shadow-black/20 backdrop-blur-md',
          'transition-[transform,opacity] duration-500 ease-out',
          revealed ? 'scale-100' : 'scale-[0.98]',
        )}
        role="dialog"
        aria-labelledby="app-rating-title"
        aria-describedby="app-rating-desc"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 id="app-rating-title" className="text-base font-semibold text-foreground">
              Como está o TerritoryRun?
            </h2>
            <p id="app-rating-desc" className="mt-1 text-sm text-muted-foreground">
              Sua opinião ajuda a melhorar o app.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Fechar avaliação"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3 flex justify-center">
          <StarRatingInput value={stars} onChange={setStars} disabled={submitting} />
        </div>

        <div className="mb-3">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, APP_RATING_MAX_COMMENT))}
            maxLength={APP_RATING_MAX_COMMENT}
            placeholder="Conte o que achou (opcional)"
            rows={3}
            disabled={submitting}
            className="resize-none text-sm"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {comment.length}/{APP_RATING_MAX_COMMENT}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="order-2 sm:order-1"
            disabled={submitting}
            onClick={handleDismiss}
          >
            Agora não
          </Button>
          <Button
            type="button"
            size="sm"
            className="order-1 sm:order-2"
            disabled={submitting || stars < 1}
            onClick={() => void handleSubmit()}
          >
            {submitting ? 'Enviando…' : 'Enviar avaliação'}
          </Button>
        </div>
      </div>
    </div>
  )
}
