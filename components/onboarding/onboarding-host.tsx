'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { OnboardingOverlay } from '@/components/onboarding/onboarding-overlay'
import { ONBOARDING_STEPS } from '@/lib/onboarding/onboarding-steps'
import {
  cacheOnboardingCompleted,
  isOnboardingCompletedCached,
} from '@/lib/onboarding/onboarding-storage'
import { completeOnboarding } from '@/lib/onboarding/onboarding-completion'
import { getUserProfile } from '@/lib/firebase/user-profile'
import { useAuthStore } from '@/lib/store/auth-store'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { log } from '@/lib/logging/logger'

const HIDDEN_PATH_PREFIXES = ['/completar-perfil', '/conta/excluir']

export function OnboardingHost() {
  const router = useRouter()
  const pathname = usePathname()
  const uid = useAuthStore((s) => s.user?.id)
  const [eligible, setEligible] = React.useState(false)
  const [active, setActive] = React.useState(false)
  const [stepIndex, setStepIndex] = React.useState(0)
  const [finishing, setFinishing] = React.useState(false)
  const hasInitializedRef = React.useRef(false)

  const pathHidden = HIDDEN_PATH_PREFIXES.some((p) => pathname.startsWith(p))

  React.useEffect(() => {
    if (pathHidden || !uid) {
      setEligible(false)
      return
    }
    if (isOnboardingCompletedCached()) {
      setEligible(false)
      return
    }

    let cancelled = false

    ;(async () => {
      if (!isFirebaseConfigured()) {
        setEligible(true)
        return
      }
      try {
        const profile = await getUserProfile(uid)
        if (cancelled) return
        if (profile?.hasCompletedOnboarding) {
          cacheOnboardingCompleted()
          setEligible(false)
          return
        }
        setEligible(true)
      } catch (e) {
        log.warn({
          scope: 'OnboardingHost',
          event: 'profile_fetch_failed',
          uid,
          message: e instanceof Error ? e.message : 'unknown',
        })
        setEligible(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [pathHidden, uid])

  React.useEffect(() => {
    if (!eligible) {
      setActive(false)
      hasInitializedRef.current = false
      return
    }
    if (hasInitializedRef.current) return

    const timer = window.setTimeout(() => {
      hasInitializedRef.current = true
      setStepIndex(0)
      const first = ONBOARDING_STEPS[0]
      if (first?.route) {
        router.push(first.route)
      }
      setActive(true)
      log.info({ scope: 'OnboardingHost', event: 'shown', uid })
    }, 600)

    return () => window.clearTimeout(timer)
  }, [eligible, uid, router])

  const persistAndClose = React.useCallback(async () => {
    if (!uid) return
    setFinishing(true)
    try {
      await completeOnboarding(uid)
    } catch {
      cacheOnboardingCompleted()
    } finally {
      setFinishing(false)
      setActive(false)
      setEligible(false)
      hasInitializedRef.current = false
    }
  }, [uid])

  const goToStep = React.useCallback(
    (index: number) => {
      const step = ONBOARDING_STEPS[index]
      if (!step) return
      if (step.route && pathname !== step.route) {
        router.push(step.route)
      }
      setStepIndex(index)
      log.info({
        scope: 'OnboardingHost',
        event: 'step',
        uid,
        stepId: step.id,
        stepIndex: index,
      })
    },
    [pathname, router, uid],
  )

  const handleNext = React.useCallback(() => {
    const step = ONBOARDING_STEPS[stepIndex]
    if (!step) return
    if (step.id === 'finish') {
      void persistAndClose()
      return
    }
    const next = stepIndex + 1
    if (next < ONBOARDING_STEPS.length) {
      goToStep(next)
    }
  }, [goToStep, persistAndClose, stepIndex])

  const handleBack = React.useCallback(() => {
    if (stepIndex <= 0) return
    goToStep(stepIndex - 1)
  }, [goToStep, stepIndex])

  const handleSkip = React.useCallback(() => {
    log.info({ scope: 'OnboardingHost', event: 'skipped', uid })
    void persistAndClose()
  }, [persistAndClose, uid])

  const step = ONBOARDING_STEPS[stepIndex]
  if (!step || !active) return null

  return (
    <OnboardingOverlay
      open={active}
      stepIndex={stepIndex}
      step={step}
      totalSteps={ONBOARDING_STEPS.length}
      onBack={handleBack}
      onNext={handleNext}
      onSkip={handleSkip}
      finishing={finishing}
    />
  )
}
