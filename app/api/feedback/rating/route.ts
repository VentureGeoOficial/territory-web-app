import { FieldValue } from 'firebase-admin/firestore'
import { NextResponse } from 'next/server'

import { assertFeedbackRateLimit, FeedbackRateLimitError } from '@/lib/api/feedback-rate-limit'
import {
  APP_RATING_MAX_COMMENT,
  appRatingSubmitSchema,
} from '@/lib/feedback/app-rating-schema'
import { ApiAuthError, verifyAuthOrFail } from '@/lib/firebase/admin-auth'
import { getAdminFirestore } from '@/lib/firebase/admin-app'
import { log } from '@/lib/logging/logger'

const COLLECTION = 'appRatings'

function sanitizeComment(raw: string | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim().slice(0, APP_RATING_MAX_COMMENT)
  if (!trimmed) return null
  return trimmed.replace(/[<>]/g, '')
}

export async function GET(req: Request) {
  try {
    const { uid } = await verifyAuthOrFail(req, { checkRevoked: false })
    const snap = await getAdminFirestore().collection(COLLECTION).doc(uid).get()

    if (!snap.exists) {
      return NextResponse.json({ hasRating: false })
    }

    const data = snap.data() as { stars?: number } | undefined
    const stars = typeof data?.stars === 'number' ? data.stars : undefined

    return NextResponse.json({ hasRating: true, stars })
  } catch (e) {
    if (e instanceof ApiAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    log.error({
      scope: 'AppRatingApi',
      event: 'get_failed',
      message: e instanceof Error ? e.message : 'unknown',
    })
    return NextResponse.json({ error: 'Erro ao consultar avaliação.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { uid } = await verifyAuthOrFail(req)

    let json: unknown
    try {
      json = await req.json()
    } catch {
      return NextResponse.json({ error: 'Corpo JSON inválido.' }, { status: 400 })
    }

    const parsed = appRatingSubmitSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Pedido inválido.', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    await assertFeedbackRateLimit(uid)

    const db = getAdminFirestore()
    const ref = db.collection(COLLECTION).doc(uid)
    const existing = await ref.get()

    if (existing.exists) {
      log.info({
        scope: 'AppRatingApi',
        event: 'duplicate_submit',
        uid,
      })
      return NextResponse.json({ error: 'Avaliação já registrada.' }, { status: 409 })
    }

    const comment = sanitizeComment(parsed.data.comment)

    await ref.set({
      stars: parsed.data.stars,
      comment,
      createdAt: FieldValue.serverTimestamp(),
    })

    log.info({
      scope: 'AppRatingApi',
      event: 'rating_saved',
      uid,
      stars: parsed.data.stars,
      hasComment: Boolean(comment),
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ApiAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    if (e instanceof FeedbackRateLimitError) {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    log.error({
      scope: 'AppRatingApi',
      event: 'post_failed',
      message: e instanceof Error ? e.message : 'unknown',
    })
    return NextResponse.json({ error: 'Erro ao salvar avaliação.' }, { status: 500 })
  }
}
