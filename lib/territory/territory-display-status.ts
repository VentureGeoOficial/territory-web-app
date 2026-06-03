import type { Territory, TerritoryStatus } from '@/lib/territory/types'

export type TerritoryDisplayKind =
  | 'expired'
  | 'disputed'
  | 'protected'
  | 'unprotected'

export interface TerritoryDisplayStatus {
  kind: TerritoryDisplayKind
  label: string
  /** Status persistido equivalente para estilização legada */
  storageStatus: TerritoryStatus
}

const LABELS: Record<TerritoryDisplayKind, string> = {
  expired: 'Expirado',
  disputed: 'Em Disputa',
  protected: 'Protegido',
  unprotected: 'Desprotegido',
}

/**
 * Estado exibido ao utilizador: proteção temporal (`protectedUntil`) tem prioridade
 * sobre `status` armazenado (corrige legado `active` + proteção activa).
 */
export function getTerritoryDisplayStatus(
  territory: Territory,
  nowMs: number = Date.now(),
): TerritoryDisplayStatus {
  if (territory.status === 'expired') {
    return {
      kind: 'expired',
      label: LABELS.expired,
      storageStatus: 'expired',
    }
  }
  if (territory.status === 'disputed') {
    return {
      kind: 'disputed',
      label: LABELS.disputed,
      storageStatus: 'disputed',
    }
  }
  const isProtected =
    territory.protectedUntil !== undefined && territory.protectedUntil > nowMs
  if (isProtected) {
    return {
      kind: 'protected',
      label: LABELS.protected,
      storageStatus: 'protected',
    }
  }
  return {
    kind: 'unprotected',
    label: LABELS.unprotected,
    storageStatus: territory.status === 'protected' ? 'active' : territory.status,
  }
}

export function isTerritoryProtectedNow(
  territory: Territory,
  nowMs: number = Date.now(),
): boolean {
  return getTerritoryDisplayStatus(territory, nowMs).kind === 'protected'
}

const MS_PER_MINUTE = 60_000
const MS_PER_HOUR = 3_600_000
const MS_PER_DAY = 86_400_000

/**
 * Texto legível do tempo restante de proteção (ex.: "2h 15min", "1 dia 3h", "45 min").
 * Retorna null se a proteção já expirou ou `protectedUntil` ausente.
 */
export function formatProtectionRemaining(
  protectedUntil: number | undefined,
  nowMs: number = Date.now(),
): string | null {
  if (protectedUntil === undefined || protectedUntil <= nowMs) {
    return null
  }
  const remainingMs = protectedUntil - nowMs
  const totalMinutes = Math.floor(remainingMs / MS_PER_MINUTE)
  const days = Math.floor(remainingMs / MS_PER_DAY)
  const hours = Math.floor((remainingMs % MS_PER_DAY) / MS_PER_HOUR)
  const minutes = Math.floor((remainingMs % MS_PER_HOUR) / MS_PER_MINUTE)

  if (days >= 1) {
    if (hours > 0) {
      return `${days} ${days === 1 ? 'dia' : 'dias'} ${hours}h`
    }
    return `${days} ${days === 1 ? 'dia' : 'dias'}`
  }
  if (totalMinutes >= 60) {
    if (minutes > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${hours}h`
  }
  if (totalMinutes > 0) {
    return `${totalMinutes} min`
  }
  return '< 1 min'
}
