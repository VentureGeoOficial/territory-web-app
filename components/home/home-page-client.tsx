'use client'

import * as React from 'react'
import {
  selectIsAuthenticated,
  useAuthStore,
} from '@/lib/store/auth-store'
import { Spinner } from '@/components/ui/spinner'
import { MarketingLanding } from '@/components/home/marketing-landing'
import { AuthenticatedDashboard } from '@/components/home/authenticated-dashboard'

export function HomePageClient() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() =>
      setHydrated(true),
    )
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
    }
    return () => {
      unsub()
    }
  }, [])

  if (!hydrated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Spinner className="size-10 text-primary" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <AuthenticatedDashboard />
  }

  return <MarketingLanding />
}
