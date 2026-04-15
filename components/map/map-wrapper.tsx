'use client'

import dynamic from 'next/dynamic'
import { Spinner } from '@/components/ui/spinner'

// Dynamic import to avoid SSR issues with Leaflet
const TerritoryMap = dynamic(
  () => import('./territory-map').then((mod) => mod.TerritoryMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-sm text-muted-foreground">Carregando mapa...</p>
        </div>
      </div>
    ),
  }
)

const MapControlsOverlay = dynamic(
  () => import('./map-controls').then((mod) => mod.MapControlsOverlay),
  {
    ssr: false,
  }
)

export function MapWrapper() {
  return (
    <div className="relative h-full w-full">
      <TerritoryMap />
      <MapControlsOverlay />
    </div>
  )
}
