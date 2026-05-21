'use client'

import * as React from 'react'
import { SponsorCard } from '@/components/loja/sponsor-card'
import { EmptySponsorState } from '@/components/loja/empty-sponsor-state'
import { CardSkeleton } from '@/components/ui/skeletons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LOJA_TAB_CATEGORIES } from '@/lib/loja/constants'
import type { PartnerCategory } from '@/lib/loja/types'
import type { Sponsor } from '@/lib/loja/types'

interface ComingSoonSponsorsSectionProps {
  sponsors: Sponsor[]
  isLoading: boolean
  categoryFilter: PartnerCategory | 'all'
  onCategoryChange: (value: PartnerCategory | 'all') => void
}

export function ComingSoonSponsorsSection({
  sponsors,
  isLoading,
  categoryFilter,
  onCategoryChange,
}: ComingSoonSponsorsSectionProps) {
  return (
    <section className="space-y-4 animate-in fade-in duration-500" aria-labelledby="sponsors-heading">
      <div>
        <h2 id="sponsors-heading" className="text-lg font-semibold text-foreground">
          Patrocinadores em breve
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Vitrines reservadas para marcas, lojas e parceiros esportivos da comunidade.
        </p>
      </div>

      <Tabs
        value={categoryFilter}
        onValueChange={(v) => onCategoryChange(v as PartnerCategory | 'all')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1">
          {LOJA_TAB_CATEGORIES.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={categoryFilter} className="mt-4">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : sponsors.length === 0 ? (
            <EmptySponsorState />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sponsors.map((sponsor) => (
                <SponsorCard key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  )
}
