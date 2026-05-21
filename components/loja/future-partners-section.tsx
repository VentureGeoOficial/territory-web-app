import { SponsorBanner } from '@/components/loja/sponsor-banner'
import type { Sponsor } from '@/lib/loja/types'

interface FuturePartnersSectionProps {
  bannerSponsors: Sponsor[]
}

export function FuturePartnersSection({ bannerSponsors }: FuturePartnersSectionProps) {
  return (
    <section className="space-y-4 animate-in fade-in duration-500 delay-100" aria-labelledby="partners-heading">
      <div>
        <h2 id="partners-heading" className="text-lg font-semibold text-foreground">
          Parceiros futuros
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Banners para promoções, cupons e campanhas de marcas esportivas.
        </p>
      </div>
      <div className="space-y-3">
        {bannerSponsors.map((sponsor) => (
          <SponsorBanner key={sponsor.id} sponsor={sponsor} />
        ))}
      </div>
    </section>
  )
}
