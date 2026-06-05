import { describe, expect, it, vi } from 'vitest'
import { EMPTY_DASHBOARD_METRICS } from '@/lib/dashboard/types'
import type { DashboardExportInput } from '@/lib/dashboard/export-report'
import { exportDashboardReport } from '@/lib/dashboard/export-report'

const sampleInput: DashboardExportInput = {
  displayName: 'João Silva',
  metrics: {
    ...EMPTY_DASHBOARD_METRICS,
    totalDistanceM: 5200,
    totalDurationSeconds: 1800,
    runCount: 2,
    avgSpeedMps: 2.89,
    territoriesCount: 3,
    totalAreaM2: 15000,
    longestRunM: 3200,
    shortestRunM: 2000,
    avgDistanceM: 2600,
    avgDurationSeconds: 900,
    maxAvgSpeedMps: 3.1,
    estimatedSteps: 6933,
    avgPaceMinPerKm: 5.77,
    weeklyDistance: [{ weekKey: '2026-05-26', distanceM: 5200 }],
    activeDaysStreak: 2,
    activityFrequencyPerWeek: 0.5,
  },
  recentRuns: [
    {
      id: 'run-1',
      distanceMeters: 3200,
      durationSeconds: 1100,
      startedAt: Date.now() - 3600000,
      endedAt: Date.now() - 100000,
      areaM2: 5000,
      xpGained: 120,
    },
  ],
}

describe('exportDashboardReport', () => {
  it('gera CSV com métricas exibidas no dashboard', () => {
    const downloads: { content: string; filename: string }[] = []

    const originalCreateElement = document.createElement.bind(document)
    const anchorClick = vi.fn()

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        Object.defineProperty(el, 'click', { value: anchorClick })
        Object.defineProperty(el, 'download', {
          set(value: string) {
            downloads.push({ content: '', filename: value })
          },
        })
        Object.defineProperty(el, 'href', {
          set(value: string) {
            const last = downloads[downloads.length - 1]
            if (last) last.content = value
          },
        })
      }
      return el
    })

    const createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation((blob) => {
        return `blob:${blob.type}`
      })
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    exportDashboardReport(sampleInput, 'csv')

    expect(downloads[0]?.filename).toMatch(/territoryrun-dashboard-\d{4}-\d{2}-\d{2}\.csv/)
    expect(createObjectURL).toHaveBeenCalled()
    expect(anchorClick).toHaveBeenCalled()
  })

  it('gera PDF sem lançar erro', () => {
    const anchorClick = vi.fn()
    const originalCreateElement = document.createElement.bind(document)

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        Object.defineProperty(el, 'click', { value: anchorClick })
      }
      return el
    })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:application/pdf')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    expect(() => exportDashboardReport(sampleInput, 'pdf')).not.toThrow()
    expect(anchorClick).toHaveBeenCalled()
  })
})
