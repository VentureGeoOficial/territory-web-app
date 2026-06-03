'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FriendsListSkeleton } from '@/components/ui/skeletons'
import { NotificationListItem } from '@/components/notifications/notification-list-item'
import {
  filterNotificationsByCategory,
  type PresentedNotification,
} from '@/lib/notifications/notification-presenter'
import type { NotificationFilter } from '@/lib/notifications/notification-categories'
import { NOTIFICATION_FILTER_ALL } from '@/lib/notifications/notification-categories'

interface NotificationListProps {
  items: PresentedNotification[]
  filter: NotificationFilter
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  error: string | null
  onLoadMore: () => Promise<void>
  onReadLocally: (id: string) => void
}

export function NotificationList({
  items,
  filter,
  loading,
  loadingMore,
  hasMore,
  error,
  onLoadMore,
  onReadLocally,
}: NotificationListProps) {
  const filtered =
    filter === NOTIFICATION_FILTER_ALL
      ? items
      : filterNotificationsByCategory(items, filter)

  if (loading) {
    return <FriendsListSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-destructive">
          {error}
        </CardContent>
      </Card>
    )
  }

  if (filtered.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Nenhuma notificação nesta categoria.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {filtered.map((item) => (
        <NotificationListItem
          key={item.id}
          item={item}
          onReadLocally={onReadLocally}
        />
      ))}
      {hasMore && filter === NOTIFICATION_FILTER_ALL && (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loadingMore}
            onClick={() => void onLoadMore()}
          >
            {loadingMore ? 'A carregar…' : 'Carregar mais'}
          </Button>
        </div>
      )}
    </div>
  )
}
