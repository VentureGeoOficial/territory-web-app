import { track } from '@vercel/analytics'

import type { TeamSocialPlatform } from './types'

export function trackTeamSocialClick(platform: TeamSocialPlatform, memberId: string) {
  track('landing_team_social_click', {
    platform,
    memberId,
    feature: 'TeamSection',
  })
}
