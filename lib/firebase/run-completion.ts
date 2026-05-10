import { isFirebaseConfigured } from './config'
import type { TrackPoint } from '@/lib/territory/types'

export interface SubmitRunCompleteParams {
  points: TrackPoint[]
  startedAt: number
  endedAt: number
  distanceMeters: number
  durationSeconds: number
  routeJson: string
  idToken: string
}

/**
 * Persistência de corrida + território + stats no servidor (`POST /api/runs/complete`).
 * O cliente não grava mais `territories` / `runs` / agregados diretamente no Firestore.
 */
export async function submitCompletedRunViaApi(
  params: SubmitRunCompleteParams,
): Promise<{ territoryId: string; runId: string }> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase não configurado.')
  }

  const res = await fetch('/api/runs/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.idToken}`,
    },
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
    const msg =
      typeof data.error === 'string'
        ? data.error
        : 'Não foi possível guardar a corrida.'
    throw new Error(msg)
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
  idToken: string
}

/**
 * Conquista sobre território inimigo (`POST /api/territories/capture`) — Admin SDK no servidor.
 */
export async function submitTerritoryCaptureViaApi(
  params: SubmitTerritoryCaptureParams,
): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase não configurado.')
  }

  const res = await fetch('/api/territories/capture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.idToken}`,
    },
    body: JSON.stringify({
      points: params.points,
      startedAt: params.startedAt,
      endedAt: params.endedAt,
      distanceMeters: params.distanceMeters,
      durationSeconds: params.durationSeconds,
      routeJson: params.routeJson,
    }),
  })

  const data = (await res.json().catch(() => ({}))) as { error?: string }

  if (!res.ok) {
    const msg =
      typeof data.error === 'string'
        ? data.error
        : 'Não foi possível concluir a conquista.'
    throw new Error(msg)
  }
}
