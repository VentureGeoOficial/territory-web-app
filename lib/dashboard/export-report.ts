import { formatPace, formatSpeedKmh } from '@/lib/dashboard/aggregate-runs'
import type { DashboardMetrics, RunRecord } from '@/lib/dashboard/types'
import { formatArea, formatDistance, formatDuration } from '@/lib/territory/geo'

export interface DashboardExportInput {
  displayName?: string
  metrics: DashboardMetrics
  recentRuns: RunRecord[]
}

export type DashboardExportFormat = 'pdf' | 'csv'

interface ReportSection {
  title: string
  rows: { label: string; value: string }[]
}

function formatRunDate(ts: number): string {
  return new Date(ts).toLocaleString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatWeekLabel(weekKey: string): string {
  const d = new Date(weekKey)
  if (Number.isNaN(d.getTime())) return weekKey
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatStreak(days: number): string {
  return `${days} dia${days !== 1 ? 's' : ''}`
}

function buildReportSections(input: DashboardExportInput): ReportSection[] {
  const { metrics } = input

  const sections: ReportSection[] = [
    {
      title: 'Resumo geral',
      rows: [
        { label: 'Distância total', value: formatDistance(metrics.totalDistanceM) },
        { label: 'Tempo em movimento', value: formatDuration(metrics.totalDurationSeconds) },
        { label: 'Percursos', value: String(metrics.runCount) },
        { label: 'Velocidade média', value: formatSpeedKmh(metrics.avgSpeedMps) },
        { label: 'Territórios dominados', value: String(metrics.territoriesCount) },
        { label: 'Área conquistada', value: formatArea(metrics.totalAreaM2) },
        {
          label: 'Passos estimados',
          value: metrics.estimatedSteps.toLocaleString('pt-BR'),
        },
        { label: 'Sequência ativa', value: formatStreak(metrics.activeDaysStreak) },
      ],
    },
    {
      title: 'Distância',
      rows: [
        { label: 'Distância acumulada', value: formatDistance(metrics.totalDistanceM) },
        {
          label: 'Média por percurso',
          value: metrics.avgDistanceM > 0 ? formatDistance(metrics.avgDistanceM) : '—',
        },
      ],
    },
    {
      title: 'Velocidade e ritmo',
      rows: [
        { label: 'Velocidade média', value: formatSpeedKmh(metrics.avgSpeedMps) },
        { label: 'Velocidade máxima', value: formatSpeedKmh(metrics.maxAvgSpeedMps) },
        { label: 'Ritmo médio', value: formatPace(metrics.avgPaceMinPerKm) },
      ],
    },
  ]

  if (metrics.runCount > 0) {
    sections.push({
      title: 'Estatísticas de percurso',
      rows: [
        { label: 'Maior percurso', value: formatDistance(metrics.longestRunM) },
        { label: 'Menor percurso', value: formatDistance(metrics.shortestRunM) },
        { label: 'Média de distância', value: formatDistance(metrics.avgDistanceM) },
        {
          label: 'Média de tempo',
          value: formatDuration(Math.round(metrics.avgDurationSeconds)),
        },
        {
          label: 'Velocidade máxima (média do trecho)',
          value: formatSpeedKmh(metrics.maxAvgSpeedMps),
        },
        { label: 'Tempo ativo total', value: formatDuration(metrics.totalDurationSeconds) },
      ],
    })
  }

  sections.push({
    title: 'Métricas de movimento',
    rows: [
      { label: 'Distância total', value: formatDistance(metrics.totalDistanceM) },
      { label: 'Tempo caminhando/correndo', value: formatDuration(metrics.totalDurationSeconds) },
      { label: 'Ritmo médio', value: formatPace(metrics.avgPaceMinPerKm) },
      {
        label: 'Passos (estimados)',
        value: metrics.estimatedSteps.toLocaleString('pt-BR'),
      },
      { label: 'Velocidade média', value: formatSpeedKmh(metrics.avgSpeedMps) },
      {
        label: 'Frequência (4 semanas)',
        value: `${metrics.activityFrequencyPerWeek.toFixed(1)} /sem`,
      },
    ],
  })

  if (metrics.weeklyDistance.length > 0) {
    sections.push({
      title: 'Evolução semanal (últimas 12 semanas)',
      rows: metrics.weeklyDistance.map((w) => ({
        label: formatWeekLabel(w.weekKey),
        value: formatDistance(w.distanceM),
      })),
    })
  }

  return sections
}

function buildActivityLines(recentRuns: RunRecord[]): string[] {
  if (recentRuns.length === 0) {
    return ['Nenhum percurso registrado ainda.']
  }

  return recentRuns.map((run) => {
    const speed =
      run.durationSeconds > 0 ? (run.distanceMeters / run.durationSeconds) * 3.6 : 0
    const badges: string[] = []
    if (run.xpGained > 0) badges.push(`+${run.xpGained} XP`)
    if (run.areaM2 > 0) badges.push('Território')
    const badgeText = badges.length > 0 ? ` (${badges.join(', ')})` : ''
    const speedText = speed > 0 ? ` · ${speed.toFixed(1)} km/h em média` : ''
    return `${formatRunDate(run.endedAt)} — ${formatDistance(run.distanceMeters)} · ${formatDuration(run.durationSeconds)}${speedText}${badgeText}`
  })
}

function escapeCsvValue(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function buildCsvContent(input: DashboardExportInput): string {
  const issuedAt = new Date().toLocaleString('pt-BR')
  const userLabel = input.displayName?.trim() || 'Atleta'
  const lines: string[] = [
    'Relatório Dashboard TerritoryRun',
    `Usuário,${escapeCsvValue(userLabel)}`,
    `Data de emissão,${escapeCsvValue(issuedAt)}`,
    '',
  ]

  for (const section of buildReportSections(input)) {
    lines.push(escapeCsvValue(section.title))
    lines.push('Métrica,Valor')
    for (const row of section.rows) {
      lines.push(`${escapeCsvValue(row.label)},${escapeCsvValue(row.value)}`)
    }
    lines.push('')
  }

  lines.push('Últimas atividades')
  lines.push('Descrição')
  for (const activity of buildActivityLines(input.recentRuns)) {
    lines.push(escapeCsvValue(activity))
  }

  return `${lines.join('\r\n')}\r\n`
}

function escapePdfText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function toLatin1Bytes(text: string): Uint8Array {
  const bytes = new Uint8Array(text.length)
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    bytes[i] = code <= 0xff ? code : 0x3f
  }
  return bytes
}

type PdfLineKind = 'brand' | 'heading' | 'meta' | 'section' | 'row' | 'spacer'

interface PdfLine {
  text: string
  kind: PdfLineKind
}

function buildPdfLines(input: DashboardExportInput): PdfLine[] {
  const issuedAt = new Date().toLocaleString('pt-BR')
  const userLabel = input.displayName?.trim() || 'Atleta'
  const lines: PdfLine[] = [
    { text: 'TerritoryRun', kind: 'brand' },
    { text: 'Relatório Dashboard', kind: 'heading' },
    { text: '', kind: 'spacer' },
    { text: `Usuário: ${userLabel}`, kind: 'meta' },
    { text: `Data de emissão: ${issuedAt}`, kind: 'meta' },
    { text: '', kind: 'spacer' },
  ]

  for (const section of buildReportSections(input)) {
    lines.push({ text: section.title, kind: 'section' })
    for (const row of section.rows) {
      lines.push({ text: `${row.label}: ${row.value}`, kind: 'row' })
    }
    lines.push({ text: '', kind: 'spacer' })
  }

  lines.push({ text: 'Últimas atividades', kind: 'section' })
  for (const activity of buildActivityLines(input.recentRuns)) {
    lines.push({ text: `• ${activity}`, kind: 'row' })
  }

  return lines
}

function fontSizeForLine(kind: PdfLineKind): number {
  if (kind === 'brand') return 16
  if (kind === 'heading' || kind === 'section') return 12
  return 10
}

function buildPdfContent(input: DashboardExportInput): Uint8Array {
  const pageWidth = 595
  const pageHeight = 842
  const marginX = 48
  const marginTop = 800
  const lineHeight = 14
  const pdfLines = buildPdfLines(input)

  const pages: string[][] = [[]]
  let currentPage = 0
  let y = marginTop

  for (const line of pdfLines) {
    if (line.kind !== 'spacer' && y < 48) {
      currentPage += 1
      pages[currentPage] = []
      y = marginTop
    }

    if (line.kind === 'spacer') {
      y -= 8
      continue
    }

    const size = fontSizeForLine(line.kind)
    pages[currentPage]!.push(
      `BT /F1 ${size} Tf ${marginX} ${y} Td (${escapePdfText(line.text)}) Tj ET`,
    )
    y -= lineHeight
  }

  const contentStreams = pages.map((pageStream) => pageStream.join('\n'))
  const pageCount = pages.length
  const fontObjectId = 3 + pageCount * 2

  const objectBodies: string[] = []

  objectBodies.push('<< /Type /Catalog /Pages 2 0 R >>')

  const pageObjectIds = Array.from({ length: pageCount }, (_, i) => 3 + i)
  const contentObjectIds = Array.from({ length: pageCount }, (_, i) => 3 + pageCount + i)

  objectBodies.push(
    `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageCount} >>`,
  )

  for (let i = 0; i < pageCount; i++) {
    objectBodies.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentObjectIds[i]} 0 R /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> >>`,
    )
  }

  for (const stream of contentStreams) {
    objectBodies.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
  }

  objectBodies.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')

  let body = '%PDF-1.4\n'
  const offsets: number[] = [0]

  for (let i = 0; i < objectBodies.length; i++) {
    const id = i + 1
    offsets[id] = toLatin1Bytes(body).length
    body += `${id} 0 obj\n${objectBodies[i]}\nendobj\n`
  }

  const totalObjects = objectBodies.length
  const xrefStart = toLatin1Bytes(body).length
  let xref = `xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`
  for (let i = 1; i <= totalObjects; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  xref += `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return toLatin1Bytes(`${body}${xref}`)
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

function buildFilename(format: DashboardExportFormat): string {
  const date = new Date().toISOString().slice(0, 10)
  return `territoryrun-dashboard-${date}.${format}`
}

export function exportDashboardReport(
  input: DashboardExportInput,
  format: DashboardExportFormat,
): void {
  if (format === 'csv') {
    const csv = buildCsvContent(input)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    downloadBlob(blob, buildFilename('csv'))
    return
  }

  const pdfBytes = buildPdfContent(input)
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  downloadBlob(blob, buildFilename('pdf'))
}
