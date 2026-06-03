import 'server-only'

import type { CaptureReactionEmoji } from '@/lib/territory/capture-reactions'
import { getAdminFirestore } from '@/lib/firebase/admin-app'
import type { CaptureVictimOutcome } from '@/lib/firebase/transactions'
import {
  territoryCapturedMessage,
  USER_NOTIFICATIONS_SUBCOLLECTION,
  type TerritoryCapturedNotificationDoc,
} from '@/lib/firebase/notifications'
import { log } from '@/lib/logging/logger'

const USERS = 'users'

export interface SendCaptureNotificationsInput {
  outcomes: CaptureVictimOutcome[]
  reactionEmoji?: CaptureReactionEmoji
  attackerUid: string
  attackerName: string
  attackerTerritoryId: string
}

/**
 * Envia notificações in-app às vítimas após conquista bem-sucedida.
 * Secundário ao fluxo principal — falhas são registadas mas nunca propagadas.
 */
export async function sendCaptureNotifications(
  input: SendCaptureNotificationsInput,
): Promise<void> {
  const { outcomes, reactionEmoji, attackerUid, attackerName, attackerTerritoryId } =
    input

  if (!reactionEmoji) {
    return
  }

  const db = getAdminFirestore()
  const now = Date.now()

  for (const outcome of outcomes) {
    if (outcome.mode !== 'partial_shrink' && outcome.mode !== 'full_expire') {
      continue
    }

    try {
      const victimRef = db.collection(USERS).doc(outcome.victimUid)
      const victimSnap = await victimRef.get()
      const prefs = victimSnap.data()?.notificationPreferences as
        | { app?: boolean }
        | undefined
      const appEnabled = prefs?.app !== false

      if (!appEnabled) {
        continue
      }

      const notifRef = victimRef.collection(USER_NOTIFICATIONS_SUBCOLLECTION).doc()
      const notif: TerritoryCapturedNotificationDoc = {
        type: 'territory_captured',
        createdAt: now,
        actorUid: attackerUid,
        actorName: attackerName,
        attackerTerritoryId,
        victimTerritoryId: outcome.territoryId,
        mode: outcome.mode,
        lostAreaM2: outcome.lostAreaM2,
        reactionEmoji,
        message: territoryCapturedMessage(outcome.mode),
      }
      await notifRef.set(notif)

      log.info({
        scope: 'CaptureNotifications',
        event: 'notification_sent',
        victimUidPrefix: outcome.victimUid.slice(0, 8),
        territoryId: outcome.territoryId,
        mode: outcome.mode,
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro desconhecido.'
      log.warn({
        scope: 'CaptureNotifications',
        event: 'notification_failed',
        victimUidPrefix: outcome.victimUid.slice(0, 8),
        territoryId: outcome.territoryId,
        message,
      })
    }
  }
}
