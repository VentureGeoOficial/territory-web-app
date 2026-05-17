import { ApiAuthError, getApiAuthHeaders } from '@/lib/auth/api-auth'
import { isFirebaseConfigured } from './config'
import type { TrackPoint } from '@/lib/territory/types'

export interface SubmitRunCompleteParams {
  points: TrackPoint[]
  startedAt: number
  endedAt: number
  distanceMeters: number
  durationSeconds: number
  routeJson: string
}

function buildApiErrorMessage(status: number, serverError?: string): string {
  if (status === 401) {
    return 'Não foi possível validar a sessão. Tente sair e entrar novamente.'
  }
  if (status === 503) {
    return 'Servidor não configurado. Adicione FIREBASE_SERVICE_ACCOUNT_JSON no .env.local.'
  }
  if (typeof serverError === 'string' && serverError.length > 0) {
    if (serverError === 'Token inválido.' || serverError === 'Token em falta.') {
      return 'Não foi possível validar a sessão. Tente sair e entrar novamente.'
    }
    return serverError
  }
  return 'Não foi possível concluir a operação.'
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
    headers,
    body: JSON.stringify({
      points: params.points,
      startedAt: params.startedAt,
      endedAt: params.endedAt,
      distanceMeters: params.distanceMeters,
      durationSeconds: params.durationSeconds,
      routeJson: params.routeJson,
    }),
  })

  const data = (await res.json().catch(() => ({}))) as {
    error?: string
    territoryId?: string
    runId?: string
    code?: string
  }

  if (!res.ok) {
    throw new Error(buildApiErrorMessage(res.status, data.error))
  }

  if (!data.territoryId || !data.runId) {
    throw new Error('Resposta inválida do servidor.')
  }

  return { territoryId: data.territoryId, runId: data.runId }
}

export interface SubmitTerritoryCaptureParams {
  points: TrackPoint[]
  startedAt: number
  endedAt: number
  distanceMeters: number
  durationSeconds: number
  routeJson: string
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

  let headers: HeadersInit
  try {
    headers = await getApiAuthHeaders()
  } catch (e) {
    if (e instanceof ApiAuthError) throw e
    throw new Error('Não foi possível obter credenciais de sessão.')
  }

  const res = await fetch('/api/territories/capture', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      points: params.points,
      startedAt: params.startedAt,
      endedAt: params.endedAt,
      distanceMeters: params.distanceMeters,
      durationSeconds: params.durationSeconds,
      routeJson: params.routeJson,
    }),
  })

  const data = (await res.json().catch(() => ({}))) as {
    error?: string
    territoryId?: string
    runId?: string
  }

  if (!res.ok) {
    throw new Error(buildApiErrorMessage(res.status, data.error))
  }

  if (!data.territoryId || !data.runId) {
    throw new Error('Resposta inválida do servidor.')
  }

  return { territoryId: data.territoryId, runId: data.runId }
}
