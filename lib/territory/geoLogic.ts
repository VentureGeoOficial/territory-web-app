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
 * Custo de conquista: 10 XP fixos + 1 XP por cada 10 m² sobrepostos a territórios inimigos.
 */
export function xpCostFromOverlappingAreaM2(totalOverlappingAreaM2: number): number {
  return 10 + Math.floor(totalOverlappingAreaM2 / 10)
}

/**
 * Calcula impacto de uma nova geometria sobre territórios existentes.
 * Só conta interseções com inimigos (userId !== attackerId) e ignora `expired`.
 * Se algum alvo intersectado estiver protegido (`protectedUntil > now`), retorna erro bloqueante.
 */
export function calculateCaptureImpact(
  newPoly: Feature<Polygon>,
  existingTerritories: Territory[],
  attackerId: string,
  nowMs: number = Date.now(),
): CaptureImpactResult {
  const intersectingEnemy: Territory[] = []

  for (const t of existingTerritories) {
    if (t.userId === attackerId) continue
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
 * Indica se há conquista inimiga (interseção com pelo menos um território inimigo capturável).
 */
export function hasEnemyCaptureOverlap(
  newPoly: Feature<Polygon>,
  existingTerritories: Territory[],
  attackerId: string,
): boolean {
  for (const t of existingTerritories) {
    if (t.userId === attackerId) continue
    if (!CAPTURABLE_STATUSES.has(t.status)) continue
    if (checkTerritoryIntersection(newPoly, t.polygon)) return true
  }
  return false
}
