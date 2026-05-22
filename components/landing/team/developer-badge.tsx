import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type DeveloperBadgeProps = {
  label: string
  className?: string
}

export function DeveloperBadge({ label, className }: DeveloperBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-primary/20 bg-primary/10 text-primary font-medium',
        className,
      )}
    >
      {label}
    </Badge>
  )
}
