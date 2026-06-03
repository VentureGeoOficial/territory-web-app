'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'

import { AppRatingPrompt } from '@/components/feedback/app-rating-prompt'
import { bottomNavItems } from '@/lib/navigation/nav-config'
import { isAppRatingPromptDismissed } from '@/lib/feedback/app-rating-prompt-storage'
import { fetchAppRatingStatus } from '@/lib/feedback/submit-app-rating'
import { trackAppRatingEvent } from '@/lib/feedback/track-app-rating'
import { isOnboardingCompletedCached } from '@/lib/onboarding/onboarding-storage'
import { isOnboardingPending } from '@/lib/onboarding/onboarding-eligibility'
import { getUserProfile } from '@/lib/firebase/user-profile'
import { useAuthStore } from '@/lib/store/auth-store'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { log } from '@/lib/logging/logger'

const PROMPT_DELAY_MS = 10_000

const HIDDEN_PATH_PREFIXES = ['/conta/excluir']

export function AppRatingHost() {
  const pathname = usePathname()
  const uid = useAuthStore((s) => s.user?.id)
  const [eligible, setEligible] = React.useState(false)
  const [visible, setVisible] = React.useState(false)
  const trackedShowRef = React.useRef(false)

  const hasBottomNav = bottomNavItems.some((item) => pathname === item.href)
  const pathHidden = HIDDEN_PATH_PREFIXES.some((p) => pathname.startsWith(p))

  React.useEffect(() => {
    if (pathHidden) {
      setEligible(false)
      setVisible(false)
      return
    }

    if (isAppRatingPromptDismissed()) {
      setEligible(false)
      return
    }

    let cancelled = false

    ;(async () => {
      if (uid && isFirebaseConfigured()) {
        if (!isOnboardingCompletedCached(uid)) {
          const profile = await getUserProfile(uid)
          if (cancelled) return
          if (isOnboardingPending(profile)) {
            setEligible(false)
            return
          }
        }
      }
      try {
        const status = await fetchAppRatingStatus()
        if (cancelled) return
        if (status.hasRating) {
          setEligible(false)
          return
        }
        setEligible(true)
      } catch (e) {
        log.warn({
          scope: 'AppRatingHost',
          event: 'status_fetch_failed',
          message: e instanceof Error ? e.message : 'unknown',
        })
        setEligible(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [pathname, pathHidden, uid])

  React.useEffect(() => {
    if (!eligible) {
      setVisible(false)
      return
    }

    const timer = setTimeout(() => {
      setVisible(true)
    }, PROMPT_DELAY_MS)

    return () => clearTimeout(timer)
  }, [eligible])

  React.useEffect(() => {
    if (visible && !trackedShowRef.current) {
      trackedShowRef.current = true
      trackAppRatingEvent('prompt_shown', 'host')
    }
  }, [visible])

  if (!visible) return null

  return (
    <AppRatingPrompt
      hasBottomNav={hasBottomNav}
      onSubmitted={() => {
        setVisible(false)
        setEligible(false)
      }}
      onDismiss={() => {
        setVisible(false)
        setEligible(false)
      }}
    />
  )
}
