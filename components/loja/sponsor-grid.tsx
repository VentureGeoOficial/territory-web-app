'use client'

import type { Sponsor } from '@/lib/sponsors/types'
import { SponsorCard } from '@/components/loja/sponsor-card'
import { SponsorCardSkeleton } from '@/components/loja/sponsor-card-skeleton'
import { EmptySponsorState } from '@/components/loja/empty-sponsor-state'

type SponsorGridProps = {
  sponsors: Sponsor[]
  loading: boolean
}

export function SponsorGrid({ sponsors, loading }: SponsorGridProps) {
  if (loading) {
    return (
      <section aria-label="Carregando parceiros">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Parceiros
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SponsorCardSkeleton key={i} />
          ))}
        </div>
      </section>
    )
  }

  const gridSponsors = sponsors.filter((s) => !s.featured)

  if (sponsors.length === 0) {
    return <EmptySponsorState />
  }

  return (
    <section aria-label="Parceiros e patrocinadores">
      {gridSponsors.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Parceiros
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gridSponsors.map((sponsor) => (
              <SponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
        </>
      )}
      {gridSponsors.length === 0 && sponsors.some((s) => s.featured) && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Mais parceiros serão adicionados em breve.
        </p>
      )}
    </section>
  )
}
