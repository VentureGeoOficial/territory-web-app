import { track } from '@vercel/analytics'

export function trackAppRatingEvent(
  action: 'prompt_shown' | 'dismissed' | 'submitted',
  section: string,
  stars?: number,
) {
  track('app_rating_event', {
    action,
    section,
    feature: 'AppRating',
    ...(stars !== undefined ? { stars: String(stars) } : {}),
  })
}
