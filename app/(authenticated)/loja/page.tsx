'use client'

import { AuthenticatedShell } from '@/components/layout/authenticated-shell'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { StoreHeroSection } from '@/components/loja/store-hero-section'
import { SponsorGrid } from '@/components/loja/sponsor-grid'
import { PartnerHighlight } from '@/components/loja/partner-highlight'
import { useSponsors } from '@/hooks/use-sponsors'

export default function LojaPage() {
  const { sponsors, loading } = useSponsors()
  const featured = sponsors.find((s) => s.featured)

  return (
    <AuthenticatedShell>
      <div className="space-y-6 max-w-6xl pb-16">
        <header>
          <h1 className="text-2xl font-bold text-foreground">Loja</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Parceiros e patrocinadores esportivos da comunidade.
          </p>
        </header>
        <StoreHeroSection featured={featured} />
        <SponsorGrid sponsors={sponsors} loading={loading} />
        <PartnerHighlight />
      </div>
      <MobileBottomNav />
    </AuthenticatedShell>
  )
}
