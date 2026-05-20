import { describe, expect, it } from 'vitest'
import { isSafeExternalUrl } from '@/lib/sponsors/utils'

describe('isSafeExternalUrl', () => {
  it('accepts https URLs', () => {
    expect(isSafeExternalUrl('https://example.com/path')).toBe(true)
  })

  it('accepts http URLs', () => {
    expect(isSafeExternalUrl('http://example.com')).toBe(true)
  })

  it('rejects javascript URLs', () => {
    expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false)
  })

  it('rejects relative paths', () => {
    expect(isSafeExternalUrl('/internal/redirect')).toBe(false)
  })

  it('rejects empty or undefined', () => {
    expect(isSafeExternalUrl(undefined)).toBe(false)
    expect(isSafeExternalUrl('')).toBe(false)
  })
})
