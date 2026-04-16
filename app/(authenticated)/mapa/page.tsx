'use client'

import { useEffect } from 'react'
import { useFirestoreTerritorySync } from '@/hooks/use-firestore-territory-sync'
import { useTerritoryStore } from '@/lib/store/territory-store'
import { Header } from '@/components/layout/header'
import { TerritorySidebar } from '@/components/territory/territory-sidebar'
import { MapWrapper } from '@/components/map/map-wrapper'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'

export default function MapaPage() {
  const initMockData = useTerritoryStore((state) => state.initMockData)
  const territories = useTerritoryStore((state) => state.territories)

  useFirestoreTerritorySync()

  useEffect(() => {
    if (territories.length === 0) {
      initMockData()
    }
  }, [initMockData, territories.length])

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden pb-14 lg:pb-0">
        {/* Sidebar fixa só em telas grandes; em mobile o acesso é via menu/header */}
        <div className="hidden lg:block h-full">
          <TerritorySidebar />
        </div>
        <main className="flex-1 relative min-w-0">
          <MapWrapper />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
