'use client'

import * as React from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  exportDashboardReport,
  type DashboardExportFormat,
  type DashboardExportInput,
} from '@/lib/dashboard/export-report'
import { log } from '@/lib/logging/logger'

interface DashboardExportButtonProps extends DashboardExportInput {
  uid?: string
  disabled?: boolean
}

export function DashboardExportButton({
  uid,
  disabled,
  displayName,
  metrics,
  recentRuns,
}: DashboardExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExport = React.useCallback(
    (format: DashboardExportFormat) => {
      if (disabled || isExporting) return

      setIsExporting(true)
      log.info({
        scope: 'DashboardExport',
        event: 'export_started',
        uid,
        format,
      })

      try {
        exportDashboardReport({ displayName, metrics, recentRuns }, format)
        log.info({
          scope: 'DashboardExport',
          event: 'export_completed',
          uid,
          format,
        })
        toast.success(
          format === 'pdf' ? 'Relatório PDF baixado.' : 'Planilha CSV baixada.',
        )
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido'
        log.error({
          scope: 'DashboardExport',
          event: 'export_failed',
          uid,
          format,
          message,
        })
        toast.error('Não foi possível gerar o relatório. Tente novamente.')
      } finally {
        setIsExporting(false)
      }
    },
    [disabled, displayName, isExporting, metrics, recentRuns, uid],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isExporting}
          className="shrink-0"
          aria-label="Baixar relatório do dashboard"
        >
          <Download className="h-4 w-4 sm:mr-2" aria-hidden />
          <span className="hidden sm:inline">
            {isExporting ? 'Gerando…' : 'Baixar Relatório'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Exportar dashboard</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="h-4 w-4" aria-hidden />
          Baixar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="h-4 w-4" aria-hidden />
          Baixar CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
