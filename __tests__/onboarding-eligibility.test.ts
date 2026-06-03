import { describe, expect, it } from 'vitest'
import {
  hasOnboardingBeenCompleted,
  isOnboardingPending,
} from '@/lib/onboarding/onboarding-eligibility'

describe('onboarding eligibility', () => {
  it('pendente só com hasCompletedOnboarding === false', () => {
    expect(isOnboardingPending({ hasCompletedOnboarding: false } as never)).toBe(true)
    expect(isOnboardingPending({ hasCompletedOnboarding: true } as never)).toBe(false)
    expect(isOnboardingPending({} as never)).toBe(false)
    expect(isOnboardingPending(null)).toBe(false)
  })

  it('concluído só com hasCompletedOnboarding === true', () => {
    expect(hasOnboardingBeenCompleted({ hasCompletedOnboarding: true } as never)).toBe(
      true,
    )
    expect(hasOnboardingBeenCompleted({ hasCompletedOnboarding: false } as never)).toBe(
      false,
    )
    expect(hasOnboardingBeenCompleted({} as never)).toBe(false)
  })
})
