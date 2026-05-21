'use client'

import * as React from 'react'
import { MOCK_BANNER_SPONSORS, MOCK_SPONSORS } from '@/lib/loja/mock-sponsors'
import type { PartnerCategory, Sponsor } from '@/lib/loja/types'

export interface UseSponsorsResult {
  sponsors: Sponsor[]
  bannerSponsors: Sponsor[]
  isLoading: boolean
}

function sortByOrder(list: Sponsor[]): Sponsor[] {
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Fase 1: dados mock estáticos.
 * Fase 2 (futuro): Firestore collection `sponsors` com where status in ['active','featured','coming_soon'].
 */
export function useSponsors(categoryFilter: PartnerCategory | 'all' = 'all'): UseSponsorsResult {
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 320)
    return () => clearTimeout(timer)
  }, [])

  const sponsors = React.useMemo(() => {
    const sorted = sortByOrder(MOCK_SPONSORS)
    if (categoryFilter === 'all') return sorted
    if (categoryFilter === 'marca') {
      return sorted.filter((s) => s.category === 'marca' || s.category === 'outro')
    }
    return sorted.filter((s) => s.category === categoryFilter)
  }, [categoryFilter])

  const bannerSponsors = React.useMemo(() => sortByOrder(MOCK_BANNER_SPONSORS), [])

  return { sponsors, bannerSponsors, isLoading }
}
