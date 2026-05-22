import type {
  DashboardMetrics,
  ProfileAggregates,
  RunRecord,
} from '@/lib/dashboard/types'
import { EMPTY_DASHBOARD_METRICS } from '@/lib/dashboard/types'

const STEPS_PER_METER = 1 / 0.75

function toDateKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function toWeekKey(ts: number): string {
  const d = new Date(ts)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

function toMonthKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function computeActiveDaysStreak(sortedRuns: RunRecord[]): number {
  if (sortedRuns.length === 0) return 0
  const days = [...new Set(sortedRuns.map((r) => toDateKey(r.endedAt)))].sort()
  if (days.length === 0) return 0

  let streak = 1
  let maxStreak = 1
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]!)
    const curr = new Date(days[i]!)
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000)
    if (diffDays === 1) {
      streak += 1
      maxStreak = Math.max(maxStreak, streak)
    } else if (diffDays > 1) {
      streak = 1
    }
  }
  return maxStreak
}

function groupWeeklyDistance(runs: RunRecord[]): DashboardMetrics['weeklyDistance'] {
  const map = new Map<string, number>()
  for (const r of runs) {
    const key = toWeekKey(r.endedAt)
    map.set(key, (map.get(key) ?? 0) + r.distanceMeters)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([weekKey, distanceM]) => ({ weekKey, distanceM }))
}

function groupMonthlyDistance(runs: RunRecord[]): DashboardMetrics['monthlyDistance'] {
  const map = new Map<string, number>()
  for (const r of runs) {
    const key = toMonthKey(r.endedAt)
    map.set(key, (map.get(key) ?? 0) + r.distanceMeters)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([monthKey, distanceM]) => ({ monthKey, distanceM }))
}

export function aggregateDashboardMetrics(
  runs: RunRecord[],
  profile: ProfileAggregates,
): DashboardMetrics {
  if (runs.length === 0) {
    return {
      ...EMPTY_DASHBOARD_METRICS,
      territoriesCount: profile.territoriesCount,
      totalAreaM2: profile.totalAreaM2,
      totalDistanceM: profile.totalDistanceM,
      totalDurationSeconds: profile.totalDurationSeconds,
    }
  }

  const sorted = [...runs].sort((a, b) => b.endedAt - a.endedAt)
  const sumDistance = runs.reduce((s, r) => s + r.distanceMeters, 0)
  const sumDuration = runs.reduce((s, r) => s + r.durationSeconds, 0)

  const totalDistanceM = Math.max(profile.totalDistanceM, sumDistance)
  const totalDurationSeconds = Math.max(profile.totalDurationSeconds, sumDuration)

  const distances = runs.map((r) => r.distanceMeters)
  const durations = runs.map((r) => r.durationSeconds)
  const speeds = runs
    .filter((r) => r.durationSeconds > 0)
    .map((r) => r.distanceMeters / r.durationSeconds)

  const avgSpeedMps =
    totalDurationSeconds > 0 ? totalDistanceM / totalDurationSeconds : 0
  const avgPaceMinPerKm =
    totalDistanceM > 0
      ? totalDurationSeconds / 60 / (totalDistanceM / 1000)
      : 0

  const now = Date.now()
  const fourWeeksAgo = now - 28 * 86400000
  const recentRuns = runs.filter((r) => r.endedAt >= fourWeeksAgo)
  const activityFrequencyPerWeek = recentRuns.length / 4

  return {
    totalDistanceM,
    totalDurationSeconds,
    runCount: runs.length,
    avgSpeedMps,
    territoriesCount: profile.territoriesCount,
    totalAreaM2: profile.totalAreaM2,
    longestRunM: Math.max(...distances),
    shortestRunM: Math.min(...distances),
    avgDistanceM: sumDistance / runs.length,
    avgDurationSeconds: sumDuration / runs.length,
    maxAvgSpeedMps: speeds.length > 0 ? Math.max(...speeds) : 0,
    estimatedSteps: Math.round(totalDistanceM * STEPS_PER_METER),
    avgPaceMinPerKm,
    weeklyDistance: groupWeeklyDistance(runs),
    monthlyDistance: groupMonthlyDistance(runs),
    activeDaysStreak: computeActiveDaysStreak(sorted),
    activityFrequencyPerWeek,
  }
}

export function formatSpeedKmh(mps: number): string {
  if (mps <= 0) return '—'
  return `${(mps * 3.6).toFixed(1)} km/h`
}

export function formatPace(minPerKm: number): string {
  if (!Number.isFinite(minPerKm) || minPerKm <= 0) return '—'
  const mins = Math.floor(minPerKm)
  const secs = Math.round((minPerKm - mins) * 60)
  return `${mins}:${String(secs).padStart(2, '0')} /km`
}
