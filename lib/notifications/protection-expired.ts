/** Janela em que um território acabou de perder proteção (para scheduled jobs). */
export function isProtectionExpiredWindow(
  protectedUntil: number,
  now: number,
  windowMs = 20 * 60 * 1000,
): boolean {
  return protectedUntil <= now && protectedUntil > now - windowMs
}

export function protectionExpiredDocId(territoryId: string): string {
  return `territory_unprotected_${territoryId}`
}
