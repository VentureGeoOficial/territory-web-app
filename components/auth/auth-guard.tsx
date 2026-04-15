'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import {
  selectIsAuthenticated,
  useAuthStore,
} from '@/lib/store/auth-store'
import { Spinner } from '@/components/ui/spinner'
import { AuthReadyContext } from '@/components/auth/auth-provider'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const [hydrated, setHydrated] = React.useState(false)
  const { firebaseAuthReady } = React.useContext(AuthReadyContext)

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

  React.useEffect(() => {
    if (hydrated && firebaseAuthReady && !isAuthenticated) {
      router.replace('/login')
    }
  }, [hydrated, firebaseAuthReady, isAuthenticated, router])

  if (!hydrated || !firebaseAuthReady || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
