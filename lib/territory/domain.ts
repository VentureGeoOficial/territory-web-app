import type { Position } from 'geojson'
import type {
  Territory,
  TerritoryStatus,
  TerritoryConfig,
  User,
} from './types'
import { DEFAULT_TERRITORY_CONFIG } from './types'
import {
  calculateTerritoryFromPositions,
  checkTerritoryIntersection,
} from './territory-generator'
import { generateId } from './geo'
import { SUZANO_BOUNDING_BOX, isPositionInsideBox } from './regions'

export interface CreateTerritoryFromDrawingParams {
  drawingPoints: Position[]
  currentUserId: string
  currentUser?: User
  /**
   * Nome exibido vindo do Auth (Firebase) – usado como fallback
   */
  authDisplayName?: string | null
  existingTerritories: Territory[]
  /**
   * Configuração de criação de território. Se omitida, usa DEFAULT_TERRITORY_CONFIG.
   */
  config?: TerritoryConfig
  /**
   * Timestamp “agora” em ms – injetável para teste. Se omitido, usa Date.now().
   */
  nowMs?: number
}

export interface CreateTerritoryFromDrawingResult {
  /**
   * Lista completa de territórios após aplicar a criação
   * (inclui o novo e quaisquer existentes atualizados para `disputed`).
   */
  territories: Territory[]
  /**
   * Território recém-criado.
   */
  newTerritory: Territory
}

/**
 * Função de domínio pura para criar um território a partir de pontos de desenho,
 * aplicar regras de disputa/proteção e retornar o novo estado de territórios.
 */
export function createTerritoryFromDrawing(
  params: CreateTerritoryFromDrawingParams
): CreateTerritoryFromDrawingResult {
  const {
    drawingPoints,
    currentUserId,
    currentUser,
    authDisplayName,
    existingTerritories,
    config,
    nowMs,
  } = params

  if (drawingPoints.length < 3) {
    throw new Error('Precisa de pelo menos 3 pontos para criar um território')
  }

  const now = nowMs ?? Date.now()
  const effectiveConfig = config ?? DEFAULT_TERRITORY_CONFIG

  const calculation = calculateTerritoryFromPositions(
    drawingPoints,
    effectiveConfig.bufferKm
  )

  // Geofence Suzano (MVP): rejeita territórios cujo centro esteja fora da região
  if (!isPositionInsideBox(calculation.center, SUZANO_BOUNDING_BOX)) {
    throw new Error('Território fora da área permitida (Suzano).')
  }

  const baseStatus: TerritoryStatus = 'active'
  let status: TerritoryStatus = baseStatus

  // Marcar disputas com territórios existentes
  const updatedTerritories = existingTerritories.map((existing) => {
    if (checkTerritoryIntersection(calculation.polygon, existing.polygon)) {
      status = 'disputed'
      return {
        ...existing,
        status: 'disputed' as TerritoryStatus,
      }
    }
    return existing
  })

  const displayName =
    currentUser?.displayName || authDisplayName || 'Corredor'

  const userColor = currentUser?.color ?? '#B8FF00'

  const newTerritory: Territory = {
    id: generateId(),
    userId: currentUserId,
    userName: displayName,
    userColor,
    polygon: calculation.polygon,
    areaM2: calculation.areaM2,
    createdAt: now,
    updatedAt: now,
    protectedUntil: now + effectiveConfig.protectionTimeMs,
    status,
    dominanceLevel: 'bronze',
    conquestCount: 1,
    center: calculation.center,
  }

  return {
    territories: [...updatedTerritories, newTerritory],
    newTerritory,
  }
}

