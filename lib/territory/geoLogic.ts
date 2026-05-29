import type { Feature, Polygon } from 'geojson'
import type { Territory } from './types'
import {
  calculateIntersectionArea,
  checkTerritoryIntersection,
} from './territory-generator'

/** Proteção após conquista inimiga (fonte da verdade no servidor). */
export const CAPTURE_PROTECTION_MS = 3 * 60 * 60 * 1000

/** Status de território que ainda pode ser alvo de conquista */
const CAPTURABLE_STATUSES = new Set<Territory['status']>([
  'active',
  'disputed',
  'protected',
])

export interface CaptureImpactOk {
  ok: true
  totalOverlappingAreaM2: number
  xpCost: number
  overlappedTerritoryIds: string[]
}

export interface CaptureImpactBlockedProtection {
  ok: false
  reason: 'protected'
  message: string
  blockedTerritoryIds: string[]
}

export type CaptureImpactResult = CaptureImpactOk | CaptureImpactBlockedProtection

/**
 * Inimigo social = amigo direto (não self).
 * Estranhos e territórios próprios ficam em camadas paralelas sem interferência.
 */
export function isSocialEnemy(
  territory: Territory,
  attackerId: string,
  friendOwnerIds: Set<string>,
): boolean {
  return (
    territory.userId !== attackerId && friendOwnerIds.has(territory.userId)
  )
}

/**
 * Custo de conquista: 10 XP fixos + 1 XP por cada 10 m² sobrepostos a territórios inimigos.
 */
export function xpCostFromOverlappingAreaM2(totalOverlappingAreaM2: number): number {
  return 10 + Math.floor(totalOverlappingAreaM2 / 10)
}

/**
 * Calcula impacto de uma nova geometria sobre territórios existentes.
 * Só conta interseções com amigos diretos (camada social do atacante).
 * Se algum alvo intersectado estiver protegido (`protectedUntil > now`), retorna erro bloqueante.
 */
export function calculateCaptureImpact(
  newPoly: Feature<Polygon>,
  existingTerritories: Territory[],
  attackerId: string,
  friendOwnerIds: Set<string>,
  nowMs: number = Date.now(),
): CaptureImpactResult {
  const intersectingEnemy: Territory[] = []

  for (const t of existingTerritories) {
    if (!isSocialEnemy(t, attackerId, friendOwnerIds)) continue
    if (!CAPTURABLE_STATUSES.has(t.status)) continue
    if (!checkTerritoryIntersection(newPoly, t.polygon)) continue
    intersectingEnemy.push(t)
  }

  const blockedTerritoryIds = intersectingEnemy
    .filter((t) => t.protectedUntil !== undefined && t.protectedUntil > nowMs)
    .map((t) => t.id)

  if (blockedTerritoryIds.length > 0) {
    return {
      ok: false,
      reason: 'protected',
      message:
        'Um ou mais territórios alvo estão sob proteção. Aguarde o fim da proteção para conquistar.',
      blockedTerritoryIds,
    }
  }

  let totalOverlappingAreaM2 = 0
  const overlappedTerritoryIds: string[] = []

  for (const t of intersectingEnemy) {
    overlappedTerritoryIds.push(t.id)
    const { areaM2 } = calculateIntersectionArea(newPoly, t.polygon)
    totalOverlappingAreaM2 += areaM2
  }

  const xpCost = xpCostFromOverlappingAreaM2(totalOverlappingAreaM2)

  return {
    ok: true,
    totalOverlappingAreaM2,
    xpCost,
    overlappedTerritoryIds,
  }
}

/**
 * Indica se há overlap capturável com amigos diretos.
 */
export function hasFriendCaptureOverlap(
  newPoly: Feature<Polygon>,
  existingTerritories: Territory[],
  attackerId: string,
  friendOwnerIds: Set<string>,
): boolean {
  for (const t of existingTerritories) {
    if (!isSocialEnemy(t, attackerId, friendOwnerIds)) continue
    if (!CAPTURABLE_STATUSES.has(t.status)) continue
    if (checkTerritoryIntersection(newPoly, t.polygon)) return true
  }
  return false
}

/** @deprecated Use hasFriendCaptureOverlap com friendOwnerIds. */
export function hasEnemyCaptureOverlap(
  newPoly: Feature<Polygon>,
  existingTerritories: Territory[],
  attackerId: string,
  friendOwnerIds: Set<string>,
): boolean {
  return hasFriendCaptureOverlap(
    newPoly,
    existingTerritories,
    attackerId,
    friendOwnerIds,
  )
}
