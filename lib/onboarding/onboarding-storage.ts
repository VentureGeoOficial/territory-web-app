const COMPLETED_KEY_PREFIX = 'territoryrun_onboarding_completed_'
/** Legado (global); ignorado para novas contas — migrado ao concluir por uid */
const LEGACY_COMPLETED_KEY = 'territoryrun_onboarding_completed'

function completedKey(uid: string): string {
  return `${COMPLETED_KEY_PREFIX}${uid}`
}

export function isOnboardingCompletedCached(uid: string | undefined): boolean {
  if (typeof window === 'undefined' || !uid) return true
  try {
    if (localStorage.getItem(completedKey(uid)) === '1') return true
    if (localStorage.getItem(LEGACY_COMPLETED_KEY) === '1') {
      localStorage.setItem(completedKey(uid), '1')
      localStorage.removeItem(LEGACY_COMPLETED_KEY)
      return true
    }
    return false
  } catch {
    return false
  }
}

export function cacheOnboardingCompleted(uid: string): void {
  if (!uid) return
  try {
    localStorage.setItem(completedKey(uid), '1')
    localStorage.removeItem(LEGACY_COMPLETED_KEY)
  } catch {
    /* quota / private mode */
  }
}

/** Para futuro: Configurações → Ver tutorial novamente */
export function resetOnboardingCache(uid: string): void {
  if (!uid) return
  try {
    localStorage.removeItem(completedKey(uid))
  } catch {
    /* ignore */
  }
}
