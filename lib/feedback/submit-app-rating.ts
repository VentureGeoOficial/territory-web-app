import { ApiAuthError, getApiAuthHeaders } from '@/lib/auth/api-auth'
import type { AppRatingSubmitInput } from '@/lib/feedback/app-rating-schema'

export class AppRatingApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'AppRatingApiError'
  }
}

export interface AppRatingStatus {
  hasRating: boolean
  stars?: number
}

function buildErrorMessage(status: number, serverError?: string): string {
  if (status === 401) {
    return 'Não foi possível validar a sessão. Tente sair e entrar novamente.'
  }
  if (status === 409) {
    return 'Você já enviou uma avaliação.'
  }
  if (status === 429) {
    return 'Aguarde um momento antes de tentar novamente.'
  }
  if (typeof serverError === 'string' && serverError.length > 0) {
    return serverError
  }
  return 'Não foi possível enviar a avaliação.'
}

export async function fetchAppRatingStatus(): Promise<AppRatingStatus> {
  const headers = await getApiAuthHeaders()
  const res = await fetch('/api/feedback/rating', { method: 'GET', headers })
  const body = (await res.json().catch(() => ({}))) as {
    error?: string
    hasRating?: boolean
    stars?: number
  }

  if (!res.ok) {
    throw new AppRatingApiError(buildErrorMessage(res.status, body.error), res.status)
  }

  return {
    hasRating: Boolean(body.hasRating),
    stars: typeof body.stars === 'number' ? body.stars : undefined,
  }
}

export async function submitAppRating(input: AppRatingSubmitInput): Promise<void> {
  const headers = await getApiAuthHeaders()
  const res = await fetch('/api/feedback/rating', {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  })
  const body = (await res.json().catch(() => ({}))) as { error?: string }

  if (!res.ok) {
    throw new AppRatingApiError(buildErrorMessage(res.status, body.error), res.status)
  }
}
