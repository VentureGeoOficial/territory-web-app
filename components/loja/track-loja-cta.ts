import { track } from '@vercel/analytics'

export function trackLojaCta(action: string, section: string) {
  track('loja_cta_click', {
    action,
    section,
    feature: 'Loja',
  })
}
