/** Emojis permitidos ao conquistar território de um amigo. */
export const CAPTURE_REACTION_EMOJIS = ['😀', '😈', '🏆'] as const

export type CaptureReactionEmoji = (typeof CAPTURE_REACTION_EMOJIS)[number]

export function isCaptureReactionEmoji(value: string): value is CaptureReactionEmoji {
  return (CAPTURE_REACTION_EMOJIS as readonly string[]).includes(value)
}
