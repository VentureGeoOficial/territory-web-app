const ALLOWED_PROTOCOLS = ['https:'] as const

export function isSafeExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ALLOWED_PROTOCOLS.includes(parsed.protocol as (typeof ALLOWED_PROTOCOLS)[number])
  } catch {
    return false
  }
}
