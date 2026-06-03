import { ApiAuthError, getApiAuthHeaders } from '@/lib/auth/api-auth'
import { isFirebaseConfigured } from './config'
import {
  isCaptureReactionEmoji,
  type CaptureReactionEmoji,
} from '@/lib/territory/capture-reactions'
import type { TrackPoint } from '@/lib/territory/types'

export class RunApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message)
    this.name = 'RunApiError'
  }
}

export interface SubmitRunCompleteParams {
  runId: string
  points: TrackPoint[]
  startedAt: number
  endedAt: number
  distanceMeters: number
  durationSeconds: number
  routeJson: string
}

function buildApiErrorMessage(
  status: number,
  serverError?: string,
  code?: string,
): string {
  if (code === 'NOT_FRIEND') {
    return 'Só é possível conquistar territórios de amigos. Confirme que a amizade foi aceite e sincronizada.'
  }
  if (code === 'NO_FRIEND_OVERLAP') {
    return 'Sem sobreposição com território de amigo. Use o fluxo normal de finalizar corrida.'
  }
  if (status === 401) {
    return 'Não foi possível validar a sessão. Tente sair e entrar novamente.'
  }
  if (status === 503) {
    return 'Servidor não configurado. Adicione FIREBASE_SERVICE_ACCOUNT_JSON no .env.local.'
  }
  if (status === 429) {
    return 'Aguarde um momento antes de finalizar outra corrida.'
  }
  if (typeof serverError === 'string' && serverError.length > 0) {
    if (serverError === 'Token inválido.' || serverError === 'Token em falta.') {
      return 'Não foi possível validar a sessão. Tente sair e entrar novamente.'
    }
    return serverError
  }
  return 'Não foi possível concluir a operação.'
}

async function parseApiResponse(res: Response): Promise<{
  error?: string
  territoryId?: string
  runId?: string
  code?: string
}> {
  return (await res.json().catch(() => ({}))) as {
    error?: string
    territoryId?: string
    runId?: string
    code?: string
  }
}

/**
 * Persistência de corrida + território + stats no servidor (`POST /api/runs/complete`).
 */
export async function submitCompletedRunViaApi(
  params: SubmitRunCompleteParams,
): Promise<{ territoryId: string; runId: string }> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase não configurado.')
  }

  let headers: HeadersInit
  try {
    headers = await getApiAuthHeaders()
  } catch (e) {
    if (e instanceof ApiAuthError) throw e
    throw new Error('Não foi possível obter credenciais de sessão.')
  }

  const res = await fetch('/api/runs/complete', {
    method: 'POST',
    headers: {
      ...headers,
      'Idempotency-Key': params.runId,
    },
    body: JSON.stringify({
      runId: params.runId,
      points: params.points,
      startedAt: params.startedAt,
      endedAt: params.endedAt,
      distanceMeters: params.distanceMeters,
      durationSeconds: params.durationSeconds,
      routeJson: params.routeJson,
    }),
  })

  const data = await parseApiResponse(res)

  if (!res.ok) {
    throw new RunApiError(
      buildApiErrorMessage(res.status, data.error, data.code),
      res.status,
      data.code,
    )
  }

  if (!data.territoryId || !data.runId) {
    throw new Error('Resposta inválida do servidor.')
  }

  return { territoryId: data.territoryId, runId: data.runId }
}

export interface SubmitTerritoryCaptureParams {
  runId: string
  points: TrackPoint[]
  startedAt: number
  endedAt: number
  distanceMeters: number
  durationSeconds: number
  routeJson: string
  reactionEmoji?: CaptureReactionEmoji
}

/**
 * Conquista sobre território inimigo (`POST /api/territories/capture`).
 */
export async function submitTerritoryCaptureViaApi(
  params: SubmitTerritoryCaptureParams,
): Promise<{ territoryId: string; runId: string }> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase não configurado.')
  }
  if (
    params.reactionEmoji !== undefined &&
    !isCaptureReactionEmoji(params.reactionEmoji)
  ) {
    throw new Error('Emoji de reação inválido.')
  }

  let headers: HeadersInit
  try {
    headers = await getApiAuthHeaders()
  } catch (e) {
    if (e instanceof ApiAuthError) throw e
    throw new Error('Não foi possível obter credenciais de sessão.')
  }

  const res = await fetch('/api/territories/capture', {
    method: 'POST',
    headers: {
      ...headers,
      'Idempotency-Key': params.runId,
    },
    body: JSON.stringify({
      runId: params.runId,
      points: params.points,
      startedAt: params.startedAt,
      endedAt: params.endedAt,
      distanceMeters: params.distanceMeters,
      durationSeconds: params.durationSeconds,
      routeJson: params.routeJson,
      ...(params.reactionEmoji !== undefined
        ? { reactionEmoji: params.reactionEmoji }
        : {}),
    }),
  })

  const data = await parseApiResponse(res)

  if (!res.ok) {
    throw new RunApiError(
      buildApiErrorMessage(res.status, data.error, data.code),
      res.status,
      data.code,
    )
  }

  if (!data.territoryId || !data.runId) {
    throw new Error('Resposta inválida do servidor.')
  }

  return { territoryId: data.territoryId, runId: data.runId }
}
