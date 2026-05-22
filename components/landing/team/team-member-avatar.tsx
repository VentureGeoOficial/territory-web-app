import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

import { getInitials } from './get-initials'
import type { TeamMember } from './types'

type TeamMemberAvatarProps = {
  member: TeamMember
  className?: string
}

export function TeamMemberAvatar({ member, className }: TeamMemberAvatarProps) {
  const alt = `Foto de ${member.name}, ${member.role}`

  return (
    <div
      className={cn(
        'relative mx-auto mb-6 flex h-32 w-32 items-center justify-center',
        className,
      )}
    >
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-md"
        aria-hidden
      />
      <Avatar className="relative size-32 ring-2 ring-primary/25 ring-offset-2 ring-offset-card">
        <AvatarImage
          src={member.image.src}
          alt={alt}
          loading="lazy"
          className="object-cover"
        />
        <AvatarFallback className="bg-secondary text-lg font-semibold text-foreground">
          {getInitials(member.name)}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}
