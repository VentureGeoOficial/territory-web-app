'use client'

import { useEffect, useState } from 'react'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { subscribeSponsors } from '@/lib/firebase/sponsors'
import type { Sponsor } from '@/lib/sponsors/types'

export function useSponsors(): {
  sponsors: Sponsor[]
  loading: boolean
  error: Error | null
} {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(isFirebaseConfigured())
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setSponsors([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsub = subscribeSponsors(
      (list) => {
        setSponsors(list)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
    )

    return () => unsub?.()
  }, [])

  return { sponsors, loading, error }
}
