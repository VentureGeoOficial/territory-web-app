'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { getUserProfile } from '@/lib/firebase/user-profile'
import { useAuthStore } from '@/lib/store/auth-store'

/**
 * Redireciona utilizadores sem `username` para `/completar-perfil`.
 * Não bloqueia renderização (evita esconder bottom nav e travar navegação).
 */
export function ProfileCompleteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const uid = useAuthStore((s) => s.user?.id)

  React.useEffect(() => {
    if (!uid || pathname === '/completar-perfil') return

    let cancelled = false

    void getUserProfile(uid).then((profile) => {
      if (cancelled) return
      if (profile && !String(profile.username ?? '').trim()) {
        router.replace('/completar-perfil')
      }
    })

    return () => {
      cancelled = true
    }
  }, [uid, pathname, router])

  return <>{children}</>
}
