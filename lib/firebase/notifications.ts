import type { CaptureReactionEmoji } from '@/lib/territory/capture-reactions'
import type { NotificationCategory } from '@/lib/notifications/notification-categories'

export const USER_NOTIFICATIONS_SUBCOLLECTION = 'notifications'

export type NotificationType =
  | 'territory_captured'
  | 'territory_unprotected'
  | 'friend_request_received'
  | 'friend_request_accepted'
  | 'system_welcome'
  | 'promo_sponsor'
  | 'event_available'

export interface NotificationMetadata {
  territoryId?: string
  actorUid?: string
  actorName?: string
  requestId?: string
  sponsorId?: string
  eventId?: string
  href?: string
  [key: string]: string | number | boolean | undefined
}

/** Campos comuns em documentos novos e normalizados. */
export interface NotificationDocBase {
  type: NotificationType
  category: NotificationCategory
  title: string
  message: string
  createdAt: number
  read: boolean
  readAt?: number
  metadata?: NotificationMetadata
}

/** Legado + campos específicos de captura territorial. */
export interface TerritoryCapturedNotificationDoc extends Partial<NotificationDocBase> {
  type: 'territory_captured'
  createdAt: number
  read?: boolean
  readAt?: number
  actorUid: string
  actorName: string
  attackerTerritoryId: string
  victimTerritoryId: string
  mode: 'partial_shrink' | 'full_expire'
  lostAreaM2: number
  reactionEmoji: CaptureReactionEmoji
  message: string
}

export type UserNotificationDoc = NotificationDocBase | TerritoryCapturedNotificationDoc

export function territoryCapturedMessage(mode: 'partial_shrink' | 'full_expire'): string {
  return mode === 'partial_shrink'
    ? 'Seu território foi dominado parcialmente.'
    : 'Seu território foi dominado por completo.'
}

export function isNotificationUnread(data: UserNotificationDoc): boolean {
  if (data.read === true) return false
  if (data.readAt != null && data.readAt > 0) return false
  return true
}
