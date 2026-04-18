'use client'

import * as React from 'react'
import {
  selectIsAuthenticated,
  useAuthStore,
} from '@/lib/store/auth-store'
import { MarketingLanding } from '@/components/home/marketing-landing'
import { AuthenticatedDashboard } from '@/components/home/authenticated-dashboard'
import { SplashScreen } from '@/components/home/splash-screen'

export function HomePageClient() {
  console.log("[v0] HomePageClient rendering")
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const [hydrated, setHydrated] = React.useState(false)
  
  console.log("[v0] isAuthenticated:", isAuthenticated, "hydrated:", hydrated)

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
    return <SplashScreen />
  }

  if (isAuthenticated) {
    return <AuthenticatedDashboard />
  }

  return <MarketingLanding />
}
