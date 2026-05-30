'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { getUserProfile } from '@/lib/firebase/user-profile'
import { useAuthStore } from '@/lib/store/auth-store'
import { Spinner } from '@/components/ui/spinner'

/**
 * Redireciona utilizadores autenticados sem `username` para `/completar-perfil`.
 */
export function ProfileCompleteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const uid = useAuthStore((s) => s.user?.id)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    if (!uid) {
      setReady(true)
      return
    }

    if (pathname === '/completar-perfil') {
      setReady(true)
      return
    }

    let cancelled = false

    void (async () => {
      try {
        const profile = await getUserProfile(uid)
        if (cancelled) return
        if (profile && !String(profile.username ?? '').trim()) {
          router.replace('/completar-perfil')
          return
        }
        setReady(true)
      } catch {
        if (!cancelled) setReady(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [uid, pathname, router])

  if (!ready) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
