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
