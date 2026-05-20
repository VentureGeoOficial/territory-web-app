'use client'

import { ExternalLink, Sparkles } from 'lucide-react'

import type { Sponsor } from '@/lib/sponsors/types'
import { isSafeExternalUrl } from '@/lib/sponsors/utils'
import { log } from '@/lib/logging/logger'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SponsorBanner } from '@/components/loja/sponsor-banner'

type StoreHeroSectionProps = {
  featured?: Sponsor
}

export function StoreHeroSection({ featured }: StoreHeroSectionProps) {
  const showCta = featured && isSafeExternalUrl(featured.ctaUrl)

  if (!featured) {
    return (
      <Card className="overflow-hidden border-primary/20">
        <SponsorBanner alt="Patrocinadores em breve" priority />
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="font-semibold text-foreground">Destaque em breve</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                O primeiro patrocinador oficial aparecerá aqui.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-primary/30">
      <SponsorBanner
        bannerUrl={featured.bannerUrl}
        alt={featured.name}
        priority
      />
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/20">
              Destaque
            </Badge>
            {featured.status === 'comingSoon' && (
              <Badge variant="outline" className="border-primary/40 text-primary">
                Em breve
              </Badge>
            )}
          </div>
          <h2 className="text-lg font-bold text-foreground">{featured.name}</h2>
          <p className="text-sm text-muted-foreground">{featured.category}</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            {featured.description}
          </p>
        </div>
        {showCta && (
          <Button asChild className="shrink-0">
            <a
              href={featured.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                log.info({
                  scope: 'sponsors',
                  event: 'sponsors_cta_clicked',
                  sponsorId: featured.id,
                })
              }
            >
              {featured.ctaLabel ?? 'Conhecer parceiro'}
              <ExternalLink className="ml-1.5 size-4" aria-hidden />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
