/** Apenas URLs http(s) externas — evita javascript: e open redirect interno. */
const SAFE_EXTERNAL_URL = /^https?:\/\//i

export function isSafeExternalUrl(url: string | undefined): url is string {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()
  if (!SAFE_EXTERNAL_URL.test(trimmed)) return false
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function sortSponsors(list: { featured?: boolean; order: number }[]): void {
  list.sort((a, b) => {
    const fa = a.featured ? 1 : 0
    const fb = b.featured ? 1 : 0
    if (fb !== fa) return fb - fa
    return a.order - b.order
  })
}
