import { describe, expect, it } from 'vitest'

import { appRatingSubmitSchema } from '@/lib/feedback/app-rating-schema'

describe('appRatingSubmitSchema', () => {
  it('accepts valid stars and optional comment', () => {
    const r = appRatingSubmitSchema.safeParse({ stars: 5, comment: '  Ótimo app  ' })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.stars).toBe(5)
      expect(r.data.comment).toBe('Ótimo app')
    }
  })

  it('rejects stars out of range', () => {
    expect(appRatingSubmitSchema.safeParse({ stars: 0 }).success).toBe(false)
    expect(appRatingSubmitSchema.safeParse({ stars: 6 }).success).toBe(false)
  })

  it('rejects comment over 250 chars', () => {
    expect(
      appRatingSubmitSchema.safeParse({ stars: 4, comment: 'x'.repeat(251) }).success,
    ).toBe(false)
  })
})
