import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  Calendar,
  Megaphone,
  ShieldOff,
  Swords,
  UserPlus,
  Users,
} from 'lucide-react'
import {
  categoryForNotificationType,
  type NotificationCategory,
} from '@/lib/notifications/notification-categories'
import type {
  NotificationType,
  TerritoryCapturedNotificationDoc,
  UserNotificationDoc,
} from '@/lib/firebase/notifications'
import { isNotificationUnread } from '@/lib/firebase/notifications'

export interface PresentedNotification {
  id: string
  type: NotificationType | string
  category: NotificationCategory
  title: string
  message: string
  description?: string
  createdAt: number
  unread: boolean
  icon: LucideIcon
  href?: string
  metadata?: Record<string, string | number | boolean | undefined>
}

export function formatRelativeTime(timestamp: number, now = Date.now()): string {
  const diffMs = Math.max(0, now - timestamp)
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'Agora'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return diffMin === 1 ? 'Há 1 minuto' : `Há ${diffMin} minutos`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return diffHours === 1 ? 'Há 1 hora' : `Há ${diffHours} horas`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return diffDays === 1 ? 'Há 1 dia' : `Há ${diffDays} dias`
  return new Date(timestamp).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

function iconForType(type: string): LucideIcon {
  switch (type) {
    case 'territory_captured':
      return Swords
    case 'territory_unprotected':
      return ShieldOff
    case 'friend_request_received':
      return UserPlus
    case 'friend_request_accepted':
      return Users
    case 'promo_sponsor':
      return Megaphone
    case 'event_available':
      return Calendar
    case 'system_welcome':
      return Bell
    default:
      return Bell
  }
}

function presentTerritoryCaptured(
  id: string,
  data: TerritoryCapturedNotificationDoc,
): PresentedNotification {
  const emoji = data.reactionEmoji ?? ''
  const actor = data.actorName?.trim() || 'Um amigo'
  const title =
    data.title ??
    (data.mode === 'full_expire' ? 'Território conquistado' : 'Território dominado')
  const message =
    data.message ??
    `${actor} conquistou ${data.mode === 'full_expire' ? 'seu território' : 'parte do seu território'}.`
  const description =
    emoji.length > 0 ? `${actor} enviou ${emoji}` : undefined

  return {
    id,
    type: 'territory_captured',
    category: data.category ?? 'territory',
    title,
    message,
    description,
    createdAt: data.createdAt,
    unread: isNotificationUnread(data),
    icon: iconForType('territory_captured'),
    href: data.metadata?.href ?? '/mapa',
    metadata: {
      territoryId: data.victimTerritoryId,
      actorUid: data.actorUid,
      actorName: data.actorName,
      ...data.metadata,
    },
  }
}

export function presentNotification(
  id: string,
  raw: Record<string, unknown>,
): PresentedNotification {
  const type = String(raw.type ?? 'system_welcome')
  const createdAt = Number(raw.createdAt ?? Date.now())
  const category =
    (raw.category as NotificationCategory | undefined) ??
    categoryForNotificationType(type)

  if (type === 'territory_captured' && typeof raw.actorName === 'string') {
    return presentTerritoryCaptured(id, raw as TerritoryCapturedNotificationDoc)
  }

  const title = String(raw.title ?? 'Notificação')
  const message = String(raw.message ?? '')
  const metadata = raw.metadata as
    | Record<string, string | number | boolean | undefined>
    | undefined
  const href =
    typeof metadata?.href === 'string'
      ? metadata.href
      : type === 'friend_request_received' || type === 'friend_request_accepted'
        ? '/amigos'
        : type === 'territory_unprotected'
          ? '/mapa'
          : undefined

  let description: string | undefined
  if (type === 'friend_request_received' && metadata?.actorName) {
    description = String(metadata.actorName)
  }

  return {
    id,
    type,
    category,
    title,
    message,
    description,
    createdAt,
    unread: isNotificationUnread(raw as UserNotificationDoc),
    icon: iconForType(type),
    href,
    metadata,
  }
}

export function countUnreadNotifications(
  items: PresentedNotification[],
): number {
  return items.filter((item) => item.unread).length
}

export function filterNotificationsByCategory(
  items: PresentedNotification[],
  filter: NotificationCategory | 'all',
): PresentedNotification[] {
  if (filter === 'all') return items
  return items.filter((item) => item.category === filter)
}
