'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUnreadNotificationCount } from '@/hooks/use-unread-notification-count'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const pathname = usePathname()
  const unreadCount = useUnreadNotificationCount()
  const active = pathname === '/notificacoes'
  const badgeLabel =
    unreadCount > 99 ? '99+' : unreadCount > 0 ? String(unreadCount) : null

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'relative h-10 w-10 shrink-0 lg:h-9 lg:w-9',
        active && 'bg-primary/10 text-primary',
      )}
      asChild
    >
      <Link
        href="/notificacoes"
        aria-label={
          unreadCount > 0
            ? `Notificações, ${unreadCount} não lidas`
            : 'Notificações'
        }
        aria-current={active ? 'page' : undefined}
      >
        <Bell className="h-5 w-5" />
        {badgeLabel && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground"
            aria-hidden
          >
            {badgeLabel}
          </span>
        )}
      </Link>
    </Button>
  )
}
