import 'server-only'

import { getAdminFirestore } from '@/lib/firebase/admin-app'
import {
  USER_NOTIFICATIONS_SUBCOLLECTION,
  type NotificationDocBase,
  type NotificationMetadata,
  type NotificationType,
} from '@/lib/firebase/notifications'
import { categoryForNotificationType } from '@/lib/notifications/notification-categories'
import { log } from '@/lib/logging/logger'

const USERS = 'users'

export interface CreateUserNotificationInput {
  uid: string
  type: NotificationType
  title: string
  message: string
  category?: NotificationDocBase['category']
  metadata?: NotificationMetadata
  /** Id fixo para idempotência (ex.: territory_unprotected_{territoryId}). */
  docId?: string
  createdAt?: number
}

async function isAppNotificationsEnabled(uid: string): Promise<boolean> {
  const db = getAdminFirestore()
  const snap = await db.collection(USERS).doc(uid).get()
  const prefs = snap.data()?.notificationPreferences as { app?: boolean } | undefined
  return prefs?.app !== false
}

/**
 * Cria notificação in-app para um utilizador (Admin SDK).
 * Falhas são registadas e nunca propagadas ao fluxo principal.
 */
export async function createUserNotification(
  input: CreateUserNotificationInput,
): Promise<string | null> {
  const {
    uid,
    type,
    title,
    message,
    metadata,
    docId,
    createdAt = Date.now(),
  } = input

  try {
    const enabled = await isAppNotificationsEnabled(uid)
    if (!enabled) {
      return null
    }

    const db = getAdminFirestore()
    const userRef = db.collection(USERS).doc(uid)
    const notifRef = docId
      ? userRef.collection(USER_NOTIFICATIONS_SUBCOLLECTION).doc(docId)
      : userRef.collection(USER_NOTIFICATIONS_SUBCOLLECTION).doc()

    const payload: NotificationDocBase = {
      type,
      category: input.category ?? categoryForNotificationType(type),
      title,
      message,
      createdAt,
      read: false,
      ...(metadata ? { metadata } : {}),
    }

    await notifRef.set(payload)

    log.info({
      scope: 'AdminNotifications',
      event: 'notification_created',
      uidPrefix: uid.slice(0, 8),
      type,
      docIdPrefix: notifRef.id.slice(0, 8),
    })

    return notifRef.id
  } catch (e) {
    const errMessage = e instanceof Error ? e.message : 'Erro desconhecido.'
    log.warn({
      scope: 'AdminNotifications',
      event: 'notification_create_failed',
      uidPrefix: uid.slice(0, 8),
      type,
      message: errMessage,
    })
    return null
  }
}

export async function resolveDisplayName(uid: string): Promise<string> {
  const db = getAdminFirestore()
  const snap = await db.collection('publicProfiles').doc(uid).get()
  const name = snap.data()?.displayName
  if (typeof name === 'string' && name.trim().length > 0) {
    return name.trim()
  }
  const userSnap = await db.collection(USERS).doc(uid).get()
  const fallback = userSnap.data()?.displayName
  if (typeof fallback === 'string' && fallback.trim().length > 0) {
    return fallback.trim()
  }
  return 'Corredor'
}

export async function notifyFriendRequestReceived(params: {
  toUserId: string
  fromUserId: string
  requestId: string
}): Promise<void> {
  const actorName = await resolveDisplayName(params.fromUserId)
  await createUserNotification({
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

export async function notifyFriendRequestAccepted(params: {
  toUserId: string
  fromUserId: string
  requestId: string
}): Promise<void> {
  const actorName = await resolveDisplayName(params.toUserId)
  await createUserNotification({
    uid: params.fromUserId,
    type: 'friend_request_accepted',
    category: 'friends',
    title: 'Pedido aceite',
    message: `${actorName} aceitou seu pedido de amizade.`,
    docId: `friend_accepted_${params.requestId}`,
    metadata: {
      actorUid: params.toUserId,
      actorName,
      requestId: params.requestId,
      href: '/amigos',
    },
  })
}

export async function notifyTerritoryUnprotected(params: {
  ownerUid: string
  territoryId: string
}): Promise<void> {
  await createUserNotification({
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
