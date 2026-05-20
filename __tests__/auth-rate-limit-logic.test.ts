import { describe, expect, it } from 'vitest'

const WINDOW_MS = 60_000
const MAX_REQUESTS = 10

/**
 * Lógica pura espelhada de `lib/api/auth-rate-limit.ts` para testes sem Firestore.
 */
function nextRateLimitState(
  windowStart: number,
  count: number,
  now: number,
): { allowed: boolean; windowStart: number; count: number } {
  if (now - windowStart >= WINDOW_MS) {
    return { allowed: true, windowStart: now, count: 1 }
  }
  if (count >= MAX_REQUESTS) {
    return { allowed: false, windowStart, count }
  }
  return { allowed: true, windowStart, count: count + 1 }
}

describe('auth rate limit logic', () => {
  it('allows up to 10 requests within window', () => {
    const t0 = 1_000_000
    let windowStart = t0
    let count = 0

    for (let i = 0; i < 10; i++) {
      const next = nextRateLimitState(windowStart, count, t0 + i * 100)
      expect(next.allowed).toBe(true)
      windowStart = next.windowStart
      count = next.count
    }
    expect(count).toBe(10)
  })

  it('blocks 11th request within same window', () => {
    const t0 = 1_000_000
    const blocked = nextRateLimitState(t0, 10, t0 + 500)
    expect(blocked.allowed).toBe(false)
  })

  it('resets window after 60s', () => {
    const t0 = 1_000_000
    const after = nextRateLimitState(t0, 10, t0 + WINDOW_MS)
    expect(after.allowed).toBe(true)
    expect(after.count).toBe(1)
  })
})
