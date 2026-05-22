import { cn } from '@/lib/utils'

import { teamMembers } from './team-data'
import { TeamMemberCard } from './team-member-card'

type TeamGridProps = {
  className?: string
}

export function TeamGrid({ className }: TeamGridProps) {
  const count = teamMembers.length
  const centerLastOnTablet = count % 2 === 1

  return (
    <ul
      className={cn(
        'grid list-none gap-6 p-0 md:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {teamMembers.map((member, index) => {
        const isLast = index === count - 1
        const centerLast =
          centerLastOnTablet && isLast && count > 2

        return (
          <li
            key={member.id}
            className={cn(centerLast && 'md:col-span-2 md:max-w-sm md:justify-self-center lg:col-span-1 lg:max-w-none')}
          >
            <TeamMemberCard member={member} />
          </li>
        )
      })}
    </ul>
  )
}
