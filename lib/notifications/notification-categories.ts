export const NOTIFICATION_CATEGORIES = [
  'territory',
  'friends',
  'system',
  'promo',
  'events',
] as const

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number]

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  territory: 'Territórios',
  friends: 'Amigos',
  system: 'Sistema',
  promo: 'Promoções',
  events: 'Eventos',
}

export const NOTIFICATION_FILTER_ALL = 'all' as const
export type NotificationFilter =
  | typeof NOTIFICATION_FILTER_ALL
  | NotificationCategory

export const NOTIFICATION_FILTER_OPTIONS: {
  value: NotificationFilter
  label: string
}[] = [
  { value: NOTIFICATION_FILTER_ALL, label: 'Todas' },
  ...NOTIFICATION_CATEGORIES.map((category) => ({
    value: category,
    label: NOTIFICATION_CATEGORY_LABELS[category],
  })),
]

export function categoryForNotificationType(
  type: string,
): NotificationCategory {
  switch (type) {
    case 'territory_captured':
    case 'territory_unprotected':
      return 'territory'
    case 'friend_request_received':
    case 'friend_request_accepted':
      return 'friends'
    case 'system_welcome':
      return 'system'
    case 'promo_sponsor':
      return 'promo'
    case 'event_available':
      return 'events'
    default:
      return 'system'
  }
}
