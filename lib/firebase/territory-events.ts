import type { CaptureReactionEmoji } from '@/lib/territory/capture-reactions'

export const TERRITORY_EVENTS_SUBCOLLECTION = 'events'

export type TerritoryEventType = 'capture_partial' | 'capture_full'

export interface TerritoryEventDoc {
  type: TerritoryEventType
  at: number
  actorUid: string
  runId: string
  lostAreaM2: number
  remainderAreaM2?: number
  reactionEmoji?: CaptureReactionEmoji
}
