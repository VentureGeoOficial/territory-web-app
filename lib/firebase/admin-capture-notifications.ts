import 'server-only'

import type { CaptureReactionEmoji } from '@/lib/territory/capture-reactions'
import type { CaptureVictimOutcome } from '@/lib/firebase/transactions'
import { createUserNotification } from '@/lib/firebase/admin-notifications'
import { territoryCapturedMessage } from '@/lib/firebase/notifications'
import { log } from '@/lib/logging/logger'

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

  for (const outcome of outcomes) {
    if (outcome.mode !== 'partial_shrink' && outcome.mode !== 'full_expire') {
      continue
    }

    const title =
      outcome.mode === 'full_expire' ? 'Território conquistado' : 'Território dominado'
    const baseMessage = territoryCapturedMessage(outcome.mode)
    const message = `${attackerName} enviou ${reactionEmoji}. ${baseMessage}`

    const docId = await createUserNotification({
      uid: outcome.victimUid,
      type: 'territory_captured',
      category: 'territory',
      title,
      message,
      metadata: {
        territoryId: outcome.territoryId,
        actorUid: attackerUid,
        actorName: attackerName,
        attackerTerritoryId,
        victimTerritoryId: outcome.territoryId,
        mode: outcome.mode,
        lostAreaM2: outcome.lostAreaM2,
        reactionEmoji,
        href: '/mapa',
      },
    })

    if (docId) {
      log.info({
        scope: 'CaptureNotifications',
        event: 'notification_sent',
        victimUidPrefix: outcome.victimUid.slice(0, 8),
        territoryId: outcome.territoryId,
        mode: outcome.mode,
      })
    }
  }
}
