'use client'

import { useNotificationsListener } from '@/hooks/use-notifications'

/** Monta listener de notificações in-app (sem UI própria). */
export function NotificationsHost() {
  useNotificationsListener()
  return null
}
