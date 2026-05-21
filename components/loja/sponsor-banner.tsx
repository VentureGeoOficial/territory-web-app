'use client'

import * as React from 'react'
import { Megaphone, Ticket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PARTNER_CATEGORY_LABELS } from '@/lib/loja/constants'
import type { Sponsor } from '@/lib/loja/types'
import { cn } from '@/lib/utils'
import { trackLojaCta } from '@/components/loja/track-loja-cta'

interface SponsorBannerProps {
  sponsor: Sponsor
  className?: string
}

export function SponsorBanner({ sponsor, className }: SponsorBannerProps) {
  const isComingSoon = sponsor.status === 'coming_soon'

  return (
    <Card
      className={cn(
        'overflow-hidden border-border/60 bg-gradient-to-r from-card via-card to-primary/5 transition-colors hover:border-primary/25',
        className,
      )}
    >
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10"
            aria-hidden
          >
            <Megaphone className="h-7 w-7 text-primary" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-foreground">{sponsor.name}</p>
              <Badge variant="secondary" className="text-[10px]">
                {PARTNER_CATEGORY_LABELS[sponsor.category]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{sponsor.description}</p>
            {sponsor.couponCode && (
              <p className="flex items-center gap-1.5 text-xs font-mono text-accent">
                <Ticket className="h-3.5 w-3.5" aria-hidden />
                Cupom: {sponsor.couponCode}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 sm:w-auto w-full"
          disabled={isComingSoon}
          onClick={() => trackLojaCta('banner_em_breve', sponsor.id)}
          aria-label={`Promoção ${sponsor.name} — em breve`}
        >
          {isComingSoon ? 'Promoção em breve' : 'Ver oferta'}
        </Button>
      </CardContent>
    </Card>
  )
}
