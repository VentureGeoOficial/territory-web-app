const USERS = 'users'
const NOTIFICATIONS = 'notifications'

type NotificationType =
  | 'territory_captured'
  | 'territory_unprotected'
  | 'friend_request_received'
  | 'friend_request_accepted'
  | 'system_welcome'
  | 'promo_sponsor'
  | 'event_available'

type NotificationCategory = 'territory' | 'friends' | 'system' | 'promo' | 'events'

function categoryForType(type: NotificationType): NotificationCategory {
  switch (type) {
    case 'territory_captured':
    case 'territory_unprotected':
      return 'territory'
    case 'friend_request_received':
    case 'friend_request_accepted':
      return 'friends'
    case 'promo_sponsor':
      return 'promo'
    case 'event_available':
      return 'events'
    default:
      return 'system'
  }
}

function logNotification(
  level: 'INFO' | 'WARNING' | 'ERROR',
  event: string,
  ctx: Record<string, unknown>,
): void {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    scope: 'CloudNotifications',
    event,
    ...ctx,
  })
  if (level === 'ERROR') console.error(line)
  else if (level === 'WARNING') console.warn(line)
  else console.info(line)
}

async function isAppNotificationsEnabled(
  db: FirebaseFirestore.Firestore,
  uid: string,
): Promise<boolean> {
  const snap = await db.collection(USERS).doc(uid).get()
  const prefs = snap.data()?.notificationPreferences as { app?: boolean } | undefined
  return prefs?.app !== false
}

async function resolveDisplayName(
  db: FirebaseFirestore.Firestore,
  uid: string,
): Promise<string> {
  const publicSnap = await db.collection('publicProfiles').doc(uid).get()
  const publicName = publicSnap.data()?.displayName
  if (typeof publicName === 'string' && publicName.trim().length > 0) {
    return publicName.trim()
  }
  const userSnap = await db.collection(USERS).doc(uid).get()
  const name = userSnap.data()?.displayName
  if (typeof name === 'string' && name.trim().length > 0) {
    return name.trim()
  }
  return 'Corredor'
}

export async function createUserNotification(params: {
  db: FirebaseFirestore.Firestore
  uid: string
  type: NotificationType
  title: string
  message: string
  category?: NotificationCategory
  metadata?: Record<string, string | number | boolean | undefined>
  docId?: string
}): Promise<string | null> {
  const { db, uid, type, title, message, metadata, docId } = params

  try {
    const enabled = await isAppNotificationsEnabled(db, uid)
    if (!enabled) return null

    const userRef = db.collection(USERS).doc(uid)
    const notifRef = docId
      ? userRef.collection(NOTIFICATIONS).doc(docId)
      : userRef.collection(NOTIFICATIONS).doc()

    await notifRef.set({
      type,
      category: params.category ?? categoryForType(type),
      title,
      message,
      createdAt: Date.now(),
      read: false,
      ...(metadata ? { metadata } : {}),
    })

    logNotification('INFO', 'notification_created', {
      uidPrefix: uid.slice(0, 8),
      type,
      docIdPrefix: notifRef.id.slice(0, 8),
    })

    return notifRef.id
  } catch (e) {
    logNotification('WARNING', 'notification_create_failed', {
      uidPrefix: uid.slice(0, 8),
      type,
      message: e instanceof Error ? e.message : 'unknown',
    })
    return null
  }
}

export async function notifyFriendRequestReceivedCf(params: {
  db: FirebaseFirestore.Firestore
  toUserId: string
  fromUserId: string
  requestId: string
}): Promise<void> {
  const actorName = await resolveDisplayName(params.db, params.fromUserId)
  await createUserNotification({
    db: params.db,
    uid: params.toUserId,
    type: 'friend_request_received',
    category: 'friends',
    title: 'Novo pedido de amizade',
    message: `${actorName} quer ser seu amigo.`,
    docId: `friend_request_${params.requestId}`,
    metadata: {
      actorUid: params.fromUserId,
      actorName,
      requestId: params.requestId,
      href: '/amigos',
    },
  })
}

export async function notifyTerritoryUnprotectedCf(params: {
  db: FirebaseFirestore.Firestore
  ownerUid: string
  territoryId: string
}): Promise<void> {
  await createUserNotification({
    db: params.db,
    uid: params.ownerUid,
    type: 'territory_unprotected',
    category: 'territory',
    title: 'Território desprotegido',
    message:
      'Seu território não está mais protegido e pode ser conquistado por amigos.',
    docId: `territory_unprotected_${params.territoryId}`,
    metadata: {
      territoryId: params.territoryId,
      href: '/mapa',
    },
  })
}

export function protectionExpiredDocId(territoryId: string): string {
  return `territory_unprotected_${territoryId}`
}

export function isProtectionExpiredWindow(
  protectedUntil: number,
  now: number,
  windowMs = 20 * 60 * 1000,
): boolean {
  return protectedUntil <= now && protectedUntil > now - windowMs
}
