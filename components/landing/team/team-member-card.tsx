import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { DeveloperBadge } from './developer-badge'
import { SocialLinks } from './social-links'
import { TeamMemberAvatar } from './team-member-avatar'
import type { TeamMember } from './types'

type TeamMemberCardProps = {
  member: TeamMember
  className?: string
}

export function TeamMemberCard({ member, className }: TeamMemberCardProps) {
  return (
    <Card
      className={cn(
        'group flex h-full flex-col border-border/60 bg-card/80 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5',
        className,
      )}
    >
      <TeamMemberAvatar member={member} />

      <div className="flex flex-1 flex-col items-center">
        <h3 className="mb-2 text-xl font-semibold text-foreground">{member.name}</h3>

        <p className="mb-3 text-sm font-medium text-accent">{member.role}</p>

        {member.badge ? (
          <DeveloperBadge label={member.badge} className="mb-4" />
        ) : null}

        {member.bio ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
        ) : null}

        <SocialLinks member={member} />
      </div>
    </Card>
  )
}
