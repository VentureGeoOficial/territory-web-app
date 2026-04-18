import type { Feature, Polygon, Position, LineString } from 'geojson'

/**
 * Ponto GPS de tracking
 */
export interface TrackPoint {
  latitude: number
  longitude: number
  timestamp: number
  accuracy?: number
  altitude?: number
  speed?: number
}

/**
 * Sessao de corrida/caminhada
 */
export interface RunSession {
  id: string
  userId: string
  startTime: number
  endTime?: number
  points: TrackPoint[]
  status: 'active' | 'completed' | 'cancelled'
  distanceMeters: number
  durationSeconds: number
  averageSpeed?: number
}

/**
 * Status do territorio
 */
export type TerritoryStatus = 'active' | 'disputed' | 'protected' | 'expired'

/**
 * Nivel de dominio do territorio (por tempo de posse)
 */
export type DominanceLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

/**
 * Territorio conquistado
 */
export interface Territory {
  id: string
  userId: string
  userName?: string
  userColor?: string
  polygon: Feature<Polygon>
  areaM2: number
  createdAt: number
  updatedAt: number
  protectedUntil?: number
  status: TerritoryStatus
  dominanceLevel: DominanceLevel
  conquestCount: number
  originalRunId?: string
  center: Position
}

/**
 * Usuario do sistema
 */
export interface User {
  id: string
  displayName: string
  email?: string
  avatarUrl?: string
  color: string
  totalAreaM2: number
  territoriesCount: number
  totalDistanceM: number
  totalDurationSeconds: number
  createdAt: number
  lastActiveAt: number
}

/**
 * Configuracoes de criacao de territorio
 */
export interface TerritoryConfig {
  /** Buffer em km ao redor da rota (20 m = 0.02) */
  bufferKm: number
  /** Numero minimo de pontos GPS */
  minPoints: number
  /** Distancia maxima entre inicio e fim para fechar loop (metros) — rotas fechadas legadas */
  maxLoopGapMeters: number
  /** Duracao minima em segundos */
  minDurationSeconds: number
  /** Tempo de protecao em ms (default: 2h = 7200000) */
  protectionTimeMs: number
  /** Distancia minima do percurso em metros (corrida) */
  minRunDistanceMeters: number
  /** Fracao minima dos pontos dentro da regiao (0–1) */
  minFractionInRegion: number
}

/**
 * Resultado da validacao de rota
 */
export interface RouteValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  stats: {
    pointCount: number
    distanceMeters: number
    durationSeconds: number
    loopGapMeters: number
    estimatedAreaM2?: number
  }
}

/**
 * Resultado de calculo de territorio
 */
export interface TerritoryCalculation {
  polygon: Feature<Polygon>
  areaM2: number
  center: Position
  boundingBox: [number, number, number, number] // [minLng, minLat, maxLng, maxLat]
}

/**
 * Intersecao entre territorios
 */
export interface TerritoryIntersection {
  territory1Id: string
  territory2Id: string
  intersectionPolygon?: Feature<Polygon>
  intersectionAreaM2: number
  percentageOfTerritory1: number
  percentageOfTerritory2: number
}

/**
 * Filtros para listagem de territorios
 */
export interface TerritoryFilters {
  userId?: string
  status?: TerritoryStatus[]
  minAreaM2?: number
  maxAreaM2?: number
  boundingBox?: [number, number, number, number]
}

/**
 * Estatisticas de ranking
 */
export interface RankingEntry {
  userId: string
  userName: string
  userColor: string
  totalAreaM2: number
  territoriesCount: number
  rank: number
}

/**
 * Modo do mapa
 */
export type MapMode = 'view' | 'run'

/**
 * Estado da UI do mapa
 */
export interface MapState {
  center: Position
  zoom: number
  mode: MapMode
  selectedTerritoryId?: string
}

/**
 * Config para corrida → território (buffer 20 m, validação de rota aberta)
 */
export const RUN_TERRITORY_CONFIG: TerritoryConfig = {
  bufferKm: 0.02,
  minPoints: 8,
  maxLoopGapMeters: 0,
  minDurationSeconds: 90,
  protectionTimeMs: 2 * 60 * 60 * 1000,
  minRunDistanceMeters: 100,
  minFractionInRegion: 0.75,
}

/** @deprecated Usar RUN_TERRITORY_CONFIG */
export const DEFAULT_TERRITORY_CONFIG: TerritoryConfig = RUN_TERRITORY_CONFIG

/**
 * Cores dos territorios por nivel de dominio
 * VentureGeo Brand Colors
 */
export const DOMINANCE_COLORS: Record<DominanceLevel, string> = {
  bronze: '#D97706',
  silver: '#9CA3AF',
  gold: '#CCFF00', // Performance Lime
  platinum: '#E5E7EB',
  diamond: '#00D2FF', // Electric Blue
}

/**
 * Cores padrao dos territorios
 * VentureGeo Brand Manual (March 2026)
 * - Performance Lime: #CCFF00
 * - Electric Blue: #00D2FF
 * - Deep Navy: #19305A
 */
export const TERRITORY_COLORS = {
  own: '#CCFF00', // Performance Lime (official)
  other: '#00D2FF', // Electric Blue (official)
  disputed: '#FF4D4D', // Red for disputes
  protected: '#22c55e', // Green
  selected: '#FFFFFF', // White border
}
