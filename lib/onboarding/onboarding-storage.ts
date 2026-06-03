const COMPLETED_KEY = 'territoryrun_onboarding_completed'

export function isOnboardingCompletedCached(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return localStorage.getItem(COMPLETED_KEY) === '1'
  } catch {
    return false
  }
}

export function cacheOnboardingCompleted(): void {
  try {
    localStorage.setItem(COMPLETED_KEY, '1')
  } catch {
    /* quota / private mode */
  }
}

/** Para futuro: Configurações → Ver tutorial novamente */
export function resetOnboardingCache(): void {
  try {
    localStorage.removeItem(COMPLETED_KEY)
  } catch {
    /* ignore */
  }
}
