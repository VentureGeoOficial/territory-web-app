'use client'

import { VentureGeoBrandLogo } from '@/components/brand/venture-geo-logo'

export function SplashScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <VentureGeoBrandLogo height={88} priority />
      <h1 className="mt-4 text-2xl font-bold text-foreground">TerritoryRun</h1>
      <p className="mt-1 text-sm text-muted-foreground">Conquiste seu caminho</p>
    </div>
  )
}
