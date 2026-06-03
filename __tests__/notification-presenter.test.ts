import { describe, expect, it } from 'vitest'
import {
  countUnreadNotifications,
  filterNotificationsByCategory,
  formatRelativeTime,
  presentNotification,
} from '@/lib/notifications/notification-presenter'
import { isProtectionExpiredWindow } from '@/lib/notifications/protection-expired'

describe('notification presenter', () => {
  it('formata tempo relativo em português', () => {
    const now = Date.now()
    expect(formatRelativeTime(now - 30_000, now)).toBe('Agora')
    expect(formatRelativeTime(now - 15 * 60_000, now)).toBe('Há 15 minutos')
  })

  it('apresenta territory_captured legado', () => {
    const presented = presentNotification('n1', {
      type: 'territory_captured',
      createdAt: Date.now(),
      actorUid: 'a1',
      actorName: 'João',
      attackerTerritoryId: 't2',
      victimTerritoryId: 't1',
      mode: 'partial_shrink',
      lostAreaM2: 100,
      reactionEmoji: '😈',
      message: 'Seu território foi dominado parcialmente.',
    })
    expect(presented.title).toBe('Território dominado')
    expect(presented.unread).toBe(true)
    expect(presented.category).toBe('territory')
  })

  it('apresenta territory_captured no formato unificado', () => {
    const presented = presentNotification('n2', {
      type: 'territory_captured',
      category: 'territory',
      title: 'Território dominado',
      message: 'Maria enviou 🏆. Seu território foi dominado parcialmente.',
      createdAt: Date.now(),
      read: false,
      metadata: { actorName: 'Maria', href: '/mapa' },
    })
    expect(presented.title).toBe('Território dominado')
    expect(presented.href).toBe('/mapa')
  })

  it('apresenta promo_sponsor preparado para futuro', () => {
    const presented = presentNotification('n3', {
      type: 'promo_sponsor',
      category: 'promo',
      title: 'Promoção Running Shoes',
      message: '20% OFF para jogadores TerritoryRun.',
      createdAt: Date.now(),
      read: false,
    })
    expect(presented.category).toBe('promo')
    expect(presented.title).toContain('Promoção')
  })

  it('conta não lidas corretamente', () => {
    const items = [
      presentNotification('a', {
        type: 'system_welcome',
        title: 'A',
        message: 'B',
        createdAt: 1,
        read: false,
      }),
      presentNotification('b', {
        type: 'system_welcome',
        title: 'A',
        message: 'B',
        createdAt: 2,
        read: true,
        readAt: 3,
      }),
    ]
    expect(countUnreadNotifications(items)).toBe(1)
  })

  it('filtra por categoria', () => {
    const items = [
      presentNotification('a', {
        type: 'friend_request_received',
        category: 'friends',
        title: 'Amigo',
        message: 'Pedido',
        createdAt: 1,
        read: false,
      }),
      presentNotification('b', {
        type: 'territory_unprotected',
        category: 'territory',
        title: 'Proteção',
        message: 'Expirou',
        createdAt: 2,
        read: false,
      }),
    ]
    expect(filterNotificationsByCategory(items, 'friends')).toHaveLength(1)
  })
})

describe('protection expired window', () => {
  it('detecta janela de proteção expirada', () => {
    const now = 1_000_000
    expect(isProtectionExpiredWindow(999_000, now, 20 * 60_000)).toBe(true)
    expect(isProtectionExpiredWindow(500_000, now, 20 * 60_000)).toBe(false)
    expect(isProtectionExpiredWindow(now + 1000, now, 20 * 60_000)).toBe(false)
  })
})
