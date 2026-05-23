const DISMISS_KEY = 'territoryrun_app_rating_dismissed_at'
const DISMISS_DAYS = 14

export function isAppRatingPromptDismissed(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return false
    const dismissedAt = Number(raw)
    if (!Number.isFinite(dismissedAt)) return false
    const elapsed = Date.now() - dismissedAt
    return elapsed < DISMISS_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

export function dismissAppRatingPrompt(): void {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearAppRatingPromptDismiss(): void {
  try {
    localStorage.removeItem(DISMISS_KEY)
  } catch {
    /* ignore */
  }
}
