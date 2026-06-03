import type { UserProfileDoc } from '@/lib/firebase/user-profile'

/**
 * Tutorial só para contas novas com `hasCompletedOnboarding: false` no cadastro.
 * Contas legadas (campo ausente) ou já concluídas (`true`) não veem o tutorial.
 */
export function isOnboardingPending(
  profile: UserProfileDoc | null | undefined,
): boolean {
  return profile?.hasCompletedOnboarding === false
}

export function hasOnboardingBeenCompleted(
  profile: UserProfileDoc | null | undefined,
): boolean {
  return profile?.hasCompletedOnboarding === true
}
