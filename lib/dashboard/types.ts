export interface RunRecord {
  id: string
  distanceMeters: number
  durationSeconds: number
  startedAt: number
  endedAt: number
  areaM2: number
  xpGained: number
}

export interface DistancePeriodPoint {
  weekKey: string
  distanceM: number
}

export interface MonthDistancePoint {
  monthKey: string
  distanceM: number
}

export interface DashboardMetrics {
  totalDistanceM: number
  totalDurationSeconds: number
  runCount: number
  avgSpeedMps: number
  territoriesCount: number
  totalAreaM2: number
  longestRunM: number
  shortestRunM: number
  avgDistanceM: number
  avgDurationSeconds: number
  maxAvgSpeedMps: number
  estimatedSteps: number
  avgPaceMinPerKm: number
  weeklyDistance: DistancePeriodPoint[]
  monthlyDistance: MonthDistancePoint[]
  activeDaysStreak: number
  activityFrequencyPerWeek: number
}

export interface ProfileAggregates {
  totalDistanceM: number
  totalDurationSeconds: number
  territoriesCount: number
  totalAreaM2: number
}

export const EMPTY_DASHBOARD_METRICS: DashboardMetrics = {
  totalDistanceM: 0,
  totalDurationSeconds: 0,
  runCount: 0,
  avgSpeedMps: 0,
  territoriesCount: 0,
  totalAreaM2: 0,
  longestRunM: 0,
  shortestRunM: 0,
  avgDistanceM: 0,
  avgDurationSeconds: 0,
  maxAvgSpeedMps: 0,
  estimatedSteps: 0,
  avgPaceMinPerKm: 0,
  weeklyDistance: [],
  monthlyDistance: [],
  activeDaysStreak: 0,
  activityFrequencyPerWeek: 0,
}
