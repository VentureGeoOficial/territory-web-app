'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { formatRelativeTime, type PresentedNotification } from '@/lib/notifications/notification-presenter'
import { markNotificationAsRead } from '@/lib/notifications/mark-notification-read'

interface NotificationListItemProps {
  item: PresentedNotification
  onReadLocally: (id: string) => void
}

export function NotificationListItem({
  item,
  onReadLocally,
}: NotificationListItemProps) {
  const router = useRouter()
  const Icon = item.icon

  async function handleClick() {
    if (item.unread) {
      onReadLocally(item.id)
      try {
        await markNotificationAsRead(item.id)
      } catch (e) {
        console.error('[NotificationListItem]', e)
      }
    }
    if (item.href) {
      router.push(item.href)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      className={cn(
        'flex w-full gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted/50',
        item.unread
          ? 'border-primary/30 bg-primary/5'
          : 'border-border bg-card/60',
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          item.unread ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm text-foreground">{item.title}</p>
          {item.unread && (
            <span
              className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"
              aria-label="Não lida"
            />
          )}
        </div>
        <p className="text-sm text-muted-foreground">{item.message}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground/80">{item.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {formatRelativeTime(item.createdAt)}
        </p>
      </div>
    </button>
  )
}
