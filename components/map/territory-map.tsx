'use client'

import { useEffect, useRef, useCallback, useState, useId, useMemo, memo } from 'react'
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  CircleMarker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import type { LatLngExpression, LeafletMouseEvent, Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTerritoryStore } from '@/lib/store/territory-store'
import type { Territory } from '@/lib/territory/types'
import { formatArea } from '@/lib/territory/geo'
import { Button } from '@/components/ui/button'
import { Crosshair, MapPin, Shield, Swords } from 'lucide-react'

// Brand colors from VentureGeo manual
const BRAND = {
  lime: '#CCFF00',
  electric: '#00D2FF',
  navy: '#19305A',
  navyDark: '#0d1a2d',
  border: '#2d4a70',
  dispute: '#FF4D4D',
  success: '#22c55e',
}

// Map event handler component
function MapEventHandler() {
  const { mapMode, addDrawingPoint, setMapCenter, setMapZoom } = useTerritoryStore()

  const map = useMapEvents({
    click(e: LeafletMouseEvent) {
      if (mapMode === 'draw') {
        addDrawingPoint([e.latlng.lng, e.latlng.lat])
      }
    },
    moveend() {
      const center = map.getCenter()
      setMapCenter([center.lng, center.lat])
    },
    zoomend() {
      setMapZoom(map.getZoom())
    },
  })

  return null
}

// Component to sync map view with store
function MapViewSync() {
  const map = useMap()
  const mapCenter = useTerritoryStore((state) => state.mapCenter)
  const mapZoom = useTerritoryStore((state) => state.mapZoom)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!initializedRef.current) {
      map.setView([mapCenter[1], mapCenter[0]], mapZoom)
      initializedRef.current = true
    }
  }, [map, mapCenter, mapZoom])

  return null
}

// Location button that needs to be inside MapContainer
function LocationControl() {
  const map = useMap()
  const setMapCenter = useTerritoryStore((state) => state.setMapCenter)

  const handleLocate = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          map.setView([latitude, longitude], 16)
          setMapCenter([longitude, latitude])
        },
        (error) => {
          console.error('Erro ao obter localizacao:', error)
        }
      )
    }
  }

  return (
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: '100px', marginRight: '10px' }}>
      <div className="leaflet-control">
        <Button
          size="icon"
          className="h-11 w-11 shadow-lg border"
          style={{
            background: BRAND.navy,
            borderColor: BRAND.border,
          }}
          onClick={handleLocate}
        >
          <Crosshair className="h-5 w-5" style={{ color: BRAND.lime }} />
        </Button>
      </div>
    </div>
  )
}

// Territory polygon component - Memoized for performance
const TerritoryPolygon = memo(function TerritoryPolygon({
  territory,
  isOwn,
  isSelected,
  onClick,
}: {
  territory: Territory
  isOwn: boolean
  isSelected: boolean
  onClick: () => void
}) {
  const getColor = () => {
    if (territory.status === 'disputed') return BRAND.dispute
    if (territory.status === 'protected') return BRAND.success
    if (isOwn) return BRAND.lime
    return territory.userColor || BRAND.electric
  }

  const coordinates = territory.polygon.geometry.coordinates[0]
  const positions: LatLngExpression[] = coordinates.map(
    (coord) => [coord[1], coord[0]] as LatLngExpression
  )

  const color = getColor()
  const fillOpacity = isSelected ? 0.5 : 0.35
  const weight = isSelected ? 3 : 2

  const StatusIcon = territory.status === 'disputed' 
    ? Swords 
    : territory.status === 'protected' 
      ? Shield 
      : MapPin

  const statusColor = territory.status === 'disputed'
    ? BRAND.dispute
    : territory.status === 'protected'
      ? BRAND.success
      : BRAND.lime

  const statusLabel = territory.status === 'active'
    ? 'Ativo'
    : territory.status === 'disputed'
      ? 'Em Disputa'
      : territory.status === 'protected'
        ? 'Protegido'
        : territory.status

  return (
    <Polygon
      positions={positions}
      pathOptions={{
        color: isSelected ? '#FFFFFF' : color,
        fillColor: color,
        fillOpacity,
        weight,
        className: territory.status === 'disputed' ? 'territory-dispute' : 'territory-pulse',
      }}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup>
        <div className="min-w-52 -m-3 -mt-4">
          {/* Header */}
          <div 
            className="px-4 py-3 flex items-center gap-3"
            style={{ 
              borderBottom: `1px solid ${BRAND.border}`,
            }}
          >
            <div
              className="w-4 h-10 rounded-full shrink-0"
              style={{ 
                backgroundColor: territory.userColor || color,
                boxShadow: `0 0 8px ${territory.userColor || color}40`
              }}
            />
            <div>
              <div className="font-semibold text-foreground">
                {isOwn ? 'Seu Territorio' : territory.userName || 'Usuario'}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                Nivel {territory.dominanceLevel}
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="px-4 py-3 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Area</span>
              <span 
                className="font-mono font-bold text-lg"
                style={{ color: isOwn ? BRAND.lime : BRAND.electric }}
              >
                {formatArea(territory.areaM2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <div 
                className="flex items-center gap-1.5 px-2 py-1 rounded-md"
                style={{ 
                  background: `${statusColor}15`,
                }}
              >
                <StatusIcon className="h-3.5 w-3.5" style={{ color: statusColor }} />
                <span 
                  className="text-sm font-medium"
                  style={{ color: statusColor }}
                >
                  {statusLabel}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Conquistas</span>
              <span className="font-mono text-foreground">
                {territory.conquestCount}x
              </span>
            </div>
          </div>
        </div>
      </Popup>
    </Polygon>
  )
})

// Drawing layer component - Memoized for performance
const DrawingLayer = memo(function DrawingLayer() {
  const { drawingPoints, isDrawing } = useTerritoryStore()

  if (!isDrawing || drawingPoints.length === 0) return null

  const positions: LatLngExpression[] = drawingPoints.map(
    (point) => [point[1], point[0]] as LatLngExpression
  )

  return (
    <>
      {/* Line connecting points */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: BRAND.lime,
          weight: 3,
          dashArray: '10, 10',
        }}
      />
      
      {/* Points */}
      {drawingPoints.map((point, index) => (
        <CircleMarker
          key={index}
          center={[point[1], point[0]]}
          radius={index === 0 ? 10 : 6}
          pathOptions={{
            color: BRAND.lime,
            fillColor: index === 0 ? BRAND.lime : BRAND.navyDark,
            fillOpacity: 1,
            weight: 2,
          }}
        />
      ))}

      {/* Close line to start if 3+ points */}
      {drawingPoints.length >= 3 && (
        <Polyline
          positions={[
            [drawingPoints[drawingPoints.length - 1][1], drawingPoints[drawingPoints.length - 1][0]],
            [drawingPoints[0][1], drawingPoints[0][0]],
          ]}
          pathOptions={{
            color: BRAND.lime,
            weight: 2,
            dashArray: '5, 10',
            opacity: 0.5,
          }}
        />
      )}

      {/* Preview fill when 3+ points */}
      {drawingPoints.length >= 3 && (
        <Polygon
          positions={positions}
          pathOptions={{
            color: BRAND.lime,
            fillColor: BRAND.lime,
            fillOpacity: 0.15,
            weight: 0,
          }}
        />
      )}
    </>
  )
})

export function TerritoryMap() {
  const mapId = useId()
  const mapRef = useRef<LeafletMap | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  
  const territories = useTerritoryStore((s) => s.territories)
  const currentUserId = useTerritoryStore((s) => s.currentUserId)
  const selectedTerritoryId = useTerritoryStore((s) => s.selectedTerritoryId)
  const selectTerritory = useTerritoryStore((s) => s.selectTerritory)
  const mapCenter = useTerritoryStore((s) => s.mapCenter)
  const mapZoom = useTerritoryStore((s) => s.mapZoom)

  // Memoize the click handler to prevent unnecessary re-renders
  const handleTerritoryClick = useCallback(
    (id: string) => {
      selectTerritory(selectedTerritoryId === id ? null : id)
    },
    [selectTerritory, selectedTerritoryId]
  )

  // Memoize territory callbacks to prevent re-creating functions on each render
  const territoryClickHandlers = useMemo(() => {
    return territories.reduce((acc, territory) => {
      acc[territory.id] = () => handleTerritoryClick(territory.id)
      return acc
    }, {} as Record<string, () => void>)
  }, [territories, handleTerritoryClick])

  // Cleanup map on unmount to prevent reuse issues
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <MapContainer
      key={mapId}
      ref={mapRef}
      center={[mapCenter[1], mapCenter[0]]}
      zoom={mapZoom}
      className="h-full w-full"
      zoomControl={true}
      attributionControl={false}
      whenReady={() => setIsMapReady(true)}
    >
      {/* Dark theme tiles - CartoDB Dark Matter */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {/* Map event handlers */}
      <MapEventHandler />
      <MapViewSync />
      <LocationControl />

      {/* Render territories - using memoized click handlers */}
      {territories.map((territory) => (
        <TerritoryPolygon
          key={territory.id}
          territory={territory}
          isOwn={territory.userId === currentUserId}
          isSelected={selectedTerritoryId === territory.id}
          onClick={territoryClickHandlers[territory.id]}
        />
      ))}

      {/* Drawing layer */}
      <DrawingLayer />
    </MapContainer>
  )
}
