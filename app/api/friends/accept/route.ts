import { NextResponse } from 'next/server'
import { z } from 'zod'

import { ApiAuthError, verifyAuthOrFail } from '@/lib/firebase/admin-auth'
import { getFriendOwnerIds } from '@/lib/firebase/admin-friendship'
import {
  AcceptFriendError,
  acceptFriendRequestWithGraph,
} from '@/lib/firebase/admin-friendship-sync'
import { log } from '@/lib/logging/logger'

const bodySchema = z.object({
  requestId: z.string().min(1).max(128),
})

/**
 * Aceita pedido de amizade: atualiza `friendRequests` e cria arestas em `friendships`.
 */
export async function POST(req: Request) {
  try {
    const { uid } = await verifyAuthOrFail(req)

    let json: unknown
    try {
      json = await req.json()
    } catch {
      return NextResponse.json({ error: 'Corpo JSON inválido.' }, { status: 400 })
    }

    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Pedido inválido.', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { requestId } = parsed.data

    log.info({
      scope: 'FriendsAcceptApi',
      event: 'request_start',
      uid,
      requestIdPrefix: requestId.slice(0, 8),
    })

    const result = await acceptFriendRequestWithGraph(requestId, uid)
    const friendIds = [...(await getFriendOwnerIds(uid))]

    log.info({
      scope: 'FriendsAcceptApi',
      event: 'request_completed',
      uid,
      requestIdPrefix: requestId.slice(0, 8),
      alreadyAccepted: result.alreadyAccepted,
      friendCount: friendIds.length,
    })

    return NextResponse.json({
      ok: true,
      alreadyAccepted: result.alreadyAccepted,
      friendIds,
    })
  } catch (e) {
    if (e instanceof AcceptFriendError) {
      log.warn({
        scope: 'FriendsAcceptApi',
        event: 'accept_rejected',
        status: e.status,
        message: e.message,
      })
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    if (e instanceof ApiAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    if (e instanceof Error && e.message.includes('FIREBASE_SERVICE_ACCOUNT')) {
      return NextResponse.json(
        {
          error:
            'Servidor não configurado. Adicione FIREBASE_SERVICE_ACCOUNT_JSON no ambiente.',
        },
        { status: 503 },
      )
    }

    log.error({
      scope: 'FriendsAcceptApi',
      event: 'accept_failed',
      message: e instanceof Error ? e.message : 'unknown',
    })
    return NextResponse.json(
      { error: 'Falha ao aceitar pedido de amizade.' },
      { status: 500 },
    )
  }
}
