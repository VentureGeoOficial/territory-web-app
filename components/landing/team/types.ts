import type { StaticImageData } from 'next/image'

export type TeamSocialPlatform = 'github' | 'linkedin' | 'instagram'

export type TeamMemberSocials = Partial<Record<TeamSocialPlatform, string>>

export type TeamMember = {
  id: string
  name: string
  role: string
  bio?: string
  badge?: string
  image: StaticImageData
  socials?: TeamMemberSocials
}
