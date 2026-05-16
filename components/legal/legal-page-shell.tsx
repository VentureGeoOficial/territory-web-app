'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { VentureGeoBrandLogo } from '@/components/brand/venture-geo-logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LEGAL_VERSION } from '@/lib/app-info'
import { appendReturnTo, sanitizeReturnTo } from '@/lib/legal/return-to'

export function LegalPageShell({
  children,
  pageTitle,
  returnTo,
  crossLink,
}: {
  children: React.ReactNode
  pageTitle: string
  returnTo?: string | null
  crossLink?: { href: string; label: string }
}) {
  const router = useRouter()
  const safeReturn = sanitizeReturnTo(returnTo)

  const crossHref = crossLink
    ? safeReturn
      ? appendReturnTo(crossLink.href, safeReturn)
      : crossLink.href
    : null

  function handleBack() {
    if (safeReturn) {
      router.push(safeReturn)
      return
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                            linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative w-full max-w-3xl flex flex-col gap-6">
        <Link
          href="/"
          className="flex items-center justify-center gap-3 text-foreground hover:text-primary transition-colors"
        >
          <VentureGeoBrandLogo height={44} />
          <span className="text-lg font-bold">TerritoryRun</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h2 className="text-sm font-medium text-muted-foreground truncate">{pageTitle}</h2>
        </div>

        <Card className="border-border shadow-lg flex flex-col max-h-[min(72vh,calc(100vh-12rem))]">
          <CardContent className="p-6 sm:p-8 overflow-y-auto flex-1">{children}</CardContent>
        </Card>

        <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground px-1">
          <span>Versão legal {LEGAL_VERSION}</span>
          <div className="flex flex-wrap gap-4">
            {crossHref && (
              <Link href={crossHref} className="text-primary hover:underline font-medium">
                {crossLink!.label}
              </Link>
            )}
            <Link href="/" className="hover:text-primary transition-colors">
              Página inicial
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
