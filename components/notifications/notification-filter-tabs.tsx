'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  NOTIFICATION_FILTER_ALL,
  NOTIFICATION_FILTER_OPTIONS,
  type NotificationFilter,
} from '@/lib/notifications/notification-categories'

interface NotificationFilterTabsProps {
  value: NotificationFilter
  onChange: (value: NotificationFilter) => void
}

export function NotificationFilterTabs({
  value,
  onChange,
}: NotificationFilterTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as NotificationFilter)}
      className="w-full"
    >
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/50 p-1">
        {NOTIFICATION_FILTER_OPTIONS.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className="text-xs sm:text-sm"
          >
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export { NOTIFICATION_FILTER_ALL }
