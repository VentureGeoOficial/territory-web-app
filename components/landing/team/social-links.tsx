'use client'

import { Github, Instagram, Linkedin } from 'lucide-react'

import { cn } from '@/lib/utils'

import { isSafeExternalUrl } from './is-safe-external-url'
import { trackTeamSocialClick } from './track-team-social'
import type { TeamMember, TeamMemberSocials, TeamSocialPlatform } from './types'

const SOCIAL_CONFIG: Record<
  TeamSocialPlatform,
  { icon: typeof Github; label: (name: string) => string }
> = {
  github: {
    icon: Github,
    label: (name) => `GitHub de ${name}`,
  },
  linkedin: {
    icon: Linkedin,
    label: (name) => `LinkedIn de ${name}`,
  },
  instagram: {
    icon: Instagram,
    label: (name) => `Instagram de ${name}`,
  },
}

type SocialLinksProps = {
  member: TeamMember
  className?: string
}

function getValidSocialEntries(socials: TeamMemberSocials | undefined) {
  if (!socials) return []

  return (Object.keys(SOCIAL_CONFIG) as TeamSocialPlatform[])
    .map((platform) => {
      const url = socials[platform]
      if (!url || !isSafeExternalUrl(url)) return null
      return { platform, url }
    })
    .filter((entry): entry is { platform: TeamSocialPlatform; url: string } => entry !== null)
}

export function SocialLinks({ member, className }: SocialLinksProps) {
  const entries = getValidSocialEntries(member.socials)

  if (entries.length === 0) return null

  return (
    <div className={cn('mt-6 flex items-center justify-center gap-3', className)}>
      {entries.map(({ platform, url }) => {
        const { icon: Icon, label } = SOCIAL_CONFIG[platform]

        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label(member.name)}
            onClick={() => trackTeamSocialClick(platform, member.id)}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/80 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <Icon className="h-5 w-5" aria-hidden />
          </a>
        )
      })}
    </div>
  )
}
