import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('executeCaptureTransaction read-before-write order', () => {
  it('não contém trx.get após escritas no loop de overlaps', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'lib/firebase/transactions.ts'),
      'utf8',
    )

    const transactionStart = source.indexOf('db.runTransaction(async (trx) => {')
    expect(transactionStart).toBeGreaterThan(-1)

    const transactionBody = source.slice(transactionStart)
    const loopStart = transactionBody.indexOf('for (let i = 0; i < overlapSnaps.length; i++)')
    expect(loopStart).toBeGreaterThan(-1)

    const loopBody = transactionBody.slice(loopStart)
    const firstWrite = loopBody.search(/\btrx\.(set|update|delete)\(/)
    expect(firstWrite).toBeGreaterThan(-1)

    const afterFirstWrite = loopBody.slice(firstWrite)
    expect(afterFirstWrite).not.toMatch(/\btrx\.get\(/)
  })

  it('não importa helpers de notificação in-app', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'lib/firebase/transactions.ts'),
      'utf8',
    )

    expect(source).not.toContain('USER_NOTIFICATIONS_SUBCOLLECTION')
    expect(source).not.toContain('TerritoryCapturedNotificationDoc')
    expect(source).not.toContain('territoryCapturedMessage')
  })
})

describe('capture API reactionEmoji schema', () => {
  it('aceita body sem reactionEmoji', async () => {
    const { z } = await import('zod')
    const { CAPTURE_REACTION_EMOJIS } = await import(
      '@/lib/territory/capture-reactions'
    )

    const bodySchema = z.object({
      runId: z.string().uuid(),
      reactionEmoji: z.enum(CAPTURE_REACTION_EMOJIS).optional(),
    })

    const withoutEmoji = bodySchema.safeParse({
      runId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(withoutEmoji.success).toBe(true)

    const withEmoji = bodySchema.safeParse({
      runId: '550e8400-e29b-41d4-a716-446655440000',
      reactionEmoji: '😀',
    })
    expect(withEmoji.success).toBe(true)

    const invalidEmoji = bodySchema.safeParse({
      runId: '550e8400-e29b-41d4-a716-446655440000',
      reactionEmoji: '🔥',
    })
    expect(invalidEmoji.success).toBe(false)
  })
})

describe('sendCaptureNotifications', () => {
  it('ignora envio quando reactionEmoji não está definido', async () => {
    const { sendCaptureNotifications } = await import(
      '@/lib/firebase/admin-capture-notifications'
    )

    await expect(
      sendCaptureNotifications({
        outcomes: [
          {
            territoryId: 't1',
            victimUid: 'victim1',
            mode: 'partial_shrink',
            lostAreaM2: 100,
          },
        ],
        attackerUid: 'attacker1',
        attackerName: 'Atacante',
        attackerTerritoryId: 'new1',
      }),
    ).resolves.toBeUndefined()
  })
})
