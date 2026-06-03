import { markOnboardingCompleted } from '@/lib/firebase/user-profile'
import { cacheOnboardingCompleted } from '@/lib/onboarding/onboarding-storage'
import { log } from '@/lib/logging/logger'

export async function completeOnboarding(uid: string): Promise<void> {
  cacheOnboardingCompleted()
  try {
    await markOnboardingCompleted(uid)
    log.info({
      scope: 'OnboardingHost',
      event: 'onboarding_completed',
      uid,
    })
  } catch (e) {
    log.error({
      scope: 'OnboardingHost',
      event: 'persist_failed',
      uid,
      message: e instanceof Error ? e.message : 'unknown',
    })
    throw e
  }
}
