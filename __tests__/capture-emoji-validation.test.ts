import { describe, expect, it } from 'vitest'
import {
  CAPTURE_REACTION_EMOJIS,
  isCaptureReactionEmoji,
} from '@/lib/territory/capture-reactions'

describe('capture reaction emoji validation', () => {
  it('aceita emojis da whitelist', () => {
    for (const emoji of CAPTURE_REACTION_EMOJIS) {
      expect(isCaptureReactionEmoji(emoji)).toBe(true)
    }
  })

  it('rejeita emoji fora da whitelist', () => {
    expect(isCaptureReactionEmoji('🔥')).toBe(false)
    expect(isCaptureReactionEmoji('')).toBe(false)
  })
})
