'use client'

import Image from 'next/image'
import { ExternalLink, Store } from 'lucide-react'

import type { Sponsor } from '@/lib/sponsors/types'
import { isSafeExternalUrl } from '@/lib/sponsors/utils'
import { log } from '@/lib/logging/logger'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

type SponsorCardProps = {
  sponsor: Sponsor
  className?: string
}

export function SponsorCard({ sponsor, className }: SponsorCardProps) {
  const showCta = isSafeExternalUrl(sponsor.ctaUrl)
  const isComingSoon = sponsor.status === 'comingSoon'

  function handleCtaClick() {
    if (!showCta) return
    log.info({
      scope: 'sponsors',
      event: 'sponsors_cta_clicked',
      sponsorId: sponsor.id,
    })
  }

  return (
    <Card
      className={cn(
        'transition-colors hover:border-primary/30',
        isComingSoon && 'opacity-95',
        className,
      )}
    >
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg',
            sponsor.logoUrl
              ? 'border border-border bg-background'
              : 'bg-primary/15 text-primary',
          )}
        >
          {sponsor.logoUrl ? (
            <Image
              src={sponsor.logoUrl}
              alt=""
              width={40}
              height={40}
              className="h-full w-full object-contain p-1"
              unoptimized
            />
          ) : (
            <Store className="h-5 w-5" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle className="text-base leading-tight">{sponsor.name}</CardTitle>
          <div className="flex flex-wrap items-center gap-1">
            <Badge variant="secondary" className="text-xs font-normal">
              {sponsor.category}
            </Badge>
            {isComingSoon && (
              <Badge
                variant="outline"
                className="text-xs border-primary/40 text-primary"
              >
                Em breve
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="text-sm leading-relaxed">
          {sponsor.description}
        </CardDescription>
        {sponsor.tags && sponsor.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {sponsor.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {showCta ? (
          <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
            <a
              href={sponsor.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCtaClick}
            >
              {sponsor.ctaLabel ?? 'Visitar'}
              <ExternalLink className="ml-1.5 size-3.5" aria-hidden />
            </a>
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">Parceria em preparação</p>
        )}
      </CardContent>
    </Card>
  )
}
