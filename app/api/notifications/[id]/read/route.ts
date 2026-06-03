import { NextResponse } from 'next/server'

import { ApiAuthError, verifyAuthOrFail } from '@/lib/firebase/admin-auth'
import { getAdminFirestore } from '@/lib/firebase/admin-app'
import { USER_NOTIFICATIONS_SUBCOLLECTION } from '@/lib/firebase/notifications'
import { log } from '@/lib/logging/logger'

const USERS = 'users'

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { uid } = await verifyAuthOrFail(req)
    const { id } = await context.params

    if (!id || id.length > 128) {
      return NextResponse.json({ error: 'Notificação inválida.' }, { status: 400 })
    }

    const db = getAdminFirestore()
    const ref = db
      .collection(USERS)
      .doc(uid)
      .collection(USER_NOTIFICATIONS_SUBCOLLECTION)
      .doc(id)

    const snap = await ref.get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Notificação não encontrada.' }, { status: 404 })
    }

    const now = Date.now()
    await ref.set({ read: true, readAt: now }, { merge: true })

    log.info({
      scope: 'NotificationReadApi',
      event: 'marked_read',
      uidPrefix: uid.slice(0, 8),
      notificationIdPrefix: id.slice(0, 8),
    })

    return NextResponse.json({ ok: true, readAt: now })
  } catch (e) {
    if (e instanceof ApiAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    const message = e instanceof Error ? e.message : 'Erro interno.'
    log.error({ scope: 'NotificationReadApi', event: 'failure', message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
