'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { AuthenticatedShell } from '@/components/layout/authenticated-shell'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import {
  NotificationFilterTabs,
  NOTIFICATION_FILTER_ALL,
} from '@/components/notifications/notification-filter-tabs'
import { NotificationList } from '@/components/notifications/notification-list'
import { useNotificationInbox } from '@/hooks/use-notification-inbox'
import { useWelcomeNotificationOnce } from '@/hooks/use-notifications'
import type { NotificationFilter } from '@/lib/notifications/notification-categories'

export default function NotificacoesPage() {
  const [filter, setFilter] = React.useState<NotificationFilter>(NOTIFICATION_FILTER_ALL)
  const inbox = useNotificationInbox()
  useWelcomeNotificationOnce()

  React.useEffect(() => {
    if (inbox.error) {
      toast.error(inbox.error)
    }
  }, [inbox.error])

  return (
    <AuthenticatedShell>
      <div className="mx-auto max-w-2xl space-y-6 pb-16">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Atualizações sobre territórios, amigos e novidades do TerritoryRun.
          </p>
        </div>

        <NotificationFilterTabs value={filter} onChange={setFilter} />

        <NotificationList
          items={inbox.items}
          filter={filter}
          loading={inbox.loading}
          loadingMore={inbox.loadingMore}
          hasMore={inbox.hasMore}
          error={inbox.error}
          onLoadMore={inbox.loadMore}
          onReadLocally={inbox.markItemReadLocally}
        />
      </div>
      <MobileBottomNav />
    </AuthenticatedShell>
  )
}
