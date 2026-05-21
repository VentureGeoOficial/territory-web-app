'use client'

import * as React from 'react'
import { AuthenticatedShell } from '@/components/layout/authenticated-shell'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { ComingSoonSponsorsSection } from '@/components/loja/coming-soon-sponsors-section'
import { FuturePartnersSection } from '@/components/loja/future-partners-section'
import { PartnerHighlight } from '@/components/loja/partner-highlight'
import { StoreHeroSection } from '@/components/loja/store-hero-section'
import { useSponsors } from '@/hooks/use-sponsors'
import { useAuthStore } from '@/lib/store/auth-store'
import { log } from '@/lib/logging/logger'
import type { PartnerCategory } from '@/lib/loja/types'

export default function LojaPage() {
  const uid = useAuthStore((s) => s.user?.id)
  const [categoryFilter, setCategoryFilter] = React.useState<PartnerCategory | 'all'>('all')
  const { sponsors, bannerSponsors, isLoading } = useSponsors(categoryFilter)

  React.useEffect(() => {
    log.info({
      scope: 'LojaPage',
      event: 'page_view',
      uid,
    })
  }, [uid])

  return (
    <AuthenticatedShell>
      <main className="space-y-8 max-w-4xl w-full pb-16">
        <StoreHeroSection />
        <ComingSoonSponsorsSection
          sponsors={sponsors}
          isLoading={isLoading}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />
        <FuturePartnersSection bannerSponsors={bannerSponsors} />
        <PartnerHighlight />
      </main>
      <MobileBottomNav />
    </AuthenticatedShell>
  )
}
