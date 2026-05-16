/**
 * Valida `returnTo` para navegação interna (evita open redirect).
 * Aceita apenas paths relativos que começam com `/` e não com `//`.
 */
export function sanitizeReturnTo(value: string | undefined | null): string | null {
  if (!value || typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null
  if (trimmed.includes('://') || trimmed.includes('\\')) return null
  return trimmed
}

export function appendReturnTo(href: string, returnTo: string): string {
  const sep = href.includes('?') ? '&' : '?'
  return `${href}${sep}returnTo=${encodeURIComponent(returnTo)}`
}
