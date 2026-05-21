/** Valida URLs externas de patrocinadores (apenas https). */
export function isSafeExternalHref(href: string | undefined): href is string {
  if (!href) return false
  try {
    const url = new URL(href)
    return url.protocol === 'https:'
  } catch {
    return false
  }
}
