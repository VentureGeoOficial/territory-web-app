/** Estado de visibilidade do patrocinador na Loja. */
export type SponsorStatus = 'active' | 'comingSoon'

/** Documento `sponsors/{id}` no Firestore. */
export interface Sponsor {
  id: string
  name: string
  category: string
  description: string
  logoUrl?: string
  bannerUrl?: string
  ctaUrl?: string
  ctaLabel?: string
  tags?: string[]
  status: SponsorStatus
  featured?: boolean
  order: number
  createdAt: number
  updatedAt: number
}

export interface SponsorFirestoreDoc {
  name: string
  category: string
  description: string
  logoUrl?: string
  bannerUrl?: string
  ctaUrl?: string
  ctaLabel?: string
  tags?: string[]
  status: SponsorStatus
  featured?: boolean
  order: number
  createdAt: number
  updatedAt: number
}
