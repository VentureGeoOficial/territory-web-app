import type { CaptureReactionEmoji } from '@/lib/territory/capture-reactions'

export const USER_NOTIFICATIONS_SUBCOLLECTION = 'notifications'

export type NotificationType = 'territory_captured'

export interface TerritoryCapturedNotificationDoc {
  type: NotificationType
  createdAt: number
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

export function territoryCapturedMessage(mode: 'partial_shrink' | 'full_expire'): string {
  return mode === 'partial_shrink'
    ? 'Seu território foi dominado parcialmente.'
    : 'Seu território foi dominado por completo.'
}
