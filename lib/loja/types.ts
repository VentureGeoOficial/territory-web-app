export type SponsorStatus = 'active' | 'coming_soon' | 'featured'

export type PartnerCategory =
  | 'roupas'
  | 'tenis'
  | 'suplementos'
  | 'academia'
  | 'marca'
  | 'outro'

export interface Sponsor {
  id: string
  name: string
  category: PartnerCategory
  description: string
  tags: string[]
  status: SponsorStatus
  logoUrl?: string
  bannerUrl?: string
  ctaLabel?: string
  ctaHref?: string
  couponCode?: string
  sortOrder: number
}
