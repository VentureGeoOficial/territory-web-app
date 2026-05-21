'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Dumbbell,
  Footprints,
  LayoutGrid,
  Shirt,
  Sparkles,
  Tag,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PARTNER_CATEGORY_LABELS } from '@/lib/loja/constants'
import { isSafeExternalHref } from '@/lib/loja/validate-cta'
import type { PartnerCategory, Sponsor } from '@/lib/loja/types'
import { cn } from '@/lib/utils'
import { trackLojaCta } from '@/components/loja/track-loja-cta'

const categoryIcons: Record<PartnerCategory, LucideIcon> = {
  roupas: Shirt,
  tenis: Footprints,
  suplementos: Sparkles,
  academia: Dumbbell,
  marca: LayoutGrid,
  outro: Tag,
}

interface SponsorCardProps {
  sponsor: Sponsor
}

function SponsorCardComponent({ sponsor }: SponsorCardProps) {
  const Icon = categoryIcons[sponsor.category]
  const isComingSoon = sponsor.status === 'coming_soon'
  const hasSafeLink = isSafeExternalHref(sponsor.ctaHref)

  const handleCtaClick = () => {
    trackLojaCta(isComingSoon ? 'em_breve' : 'visitar_parceiro', `card_${sponsor.id}`)
  }

  return (
    <Card
      className={cn(
        'group transition-all duration-300 hover:border-primary/30 hover:-translate-y-0.5',
        isComingSoon && 'border-dashed border-border/80',
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
              isComingSoon ? 'bg-muted/80' : 'bg-primary/15',
            )}
            aria-hidden
          >
            {sponsor.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sponsor.logoUrl}
                alt={`Logo ${sponsor.name}`}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <Icon
                className={cn(
                  'h-6 w-6',
                  isComingSoon ? 'text-muted-foreground' : 'text-primary',
                )}
              />
            )}
          </div>
          <Badge variant={isComingSoon ? 'secondary' : 'default'} className="shrink-0">
            {isComingSoon ? 'Em breve' : 'Ativo'}
          </Badge>
        </div>
        <CardTitle className="text-base">{sponsor.name}</CardTitle>
        <CardDescription className="text-xs">
          {PARTNER_CATEGORY_LABELS[sponsor.category]}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{sponsor.description}</p>
        {sponsor.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {sponsor.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {hasSafeLink && sponsor.ctaHref ? (
          <Button asChild size="sm" className="w-full">
            <Link
              href={sponsor.ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCtaClick}
              aria-label={`${sponsor.ctaLabel ?? 'Visitar'} — ${sponsor.name}`}
            >
              {sponsor.ctaLabel ?? 'Visitar parceiro'}
            </Link>
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            disabled={isComingSoon}
            onClick={handleCtaClick}
            aria-label={isComingSoon ? 'Parceiro em breve' : 'Saiba mais'}
          >
            {isComingSoon ? 'Em breve' : sponsor.ctaLabel ?? 'Saiba mais'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export const SponsorCard = React.memo(SponsorCardComponent)
