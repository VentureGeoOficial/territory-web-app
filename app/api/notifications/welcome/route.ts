import { NextResponse } from 'next/server'

import { ApiAuthError, verifyAuthOrFail } from '@/lib/firebase/admin-auth'
import { createUserNotification } from '@/lib/firebase/admin-notifications'
import { log } from '@/lib/logging/logger'

export async function POST(req: Request) {
  try {
    const { uid } = await verifyAuthOrFail(req)

    await createUserNotification({
      uid,
      type: 'system_welcome',
      category: 'system',
      title: 'Bem-vindo ao TerritoryRun',
      message: 'Sua central de notificações está pronta. Boa corrida!',
      docId: 'system_welcome',
      metadata: { href: '/mapa' },
    })

    log.info({
      scope: 'NotificationWelcomeApi',
      event: 'welcome_sent',
      uidPrefix: uid.slice(0, 8),
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ApiAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    const message = e instanceof Error ? e.message : 'Erro interno.'
    log.error({ scope: 'NotificationWelcomeApi', event: 'failure', message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
