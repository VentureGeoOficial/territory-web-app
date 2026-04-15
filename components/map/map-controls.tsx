'use client'

import { memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { saveTerritoryAndUpdateUserStats } from '@/lib/firebase/territories'
import { useTerritoryStore } from '@/lib/store/territory-store'
import {
  Pencil,
  X,
  Check,
  Undo2,
  Eye,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// This overlay is rendered OUTSIDE the MapContainer
// It only handles drawing controls which don't need map access
// Memoized for performance
export const MapControlsOverlay = memo(function MapControlsOverlay() {
  const mapMode = useTerritoryStore((s) => s.mapMode)
  const setMapMode = useTerritoryStore((s) => s.setMapMode)
  const drawingPoints = useTerritoryStore((s) => s.drawingPoints)
  const clearDrawing = useTerritoryStore((s) => s.clearDrawing)
  const removeLastDrawingPoint = useTerritoryStore((s) => s.removeLastDrawingPoint)
  const finishDrawing = useTerritoryStore((s) => s.finishDrawing)

  const isDrawing = mapMode === 'draw'
  const canFinish = drawingPoints.length >= 3
  const canUndo = drawingPoints.length > 0

  const handleStartDrawing = useCallback(() => {
    setMapMode('draw')
  }, [setMapMode])

  const handleCancelDrawing = useCallback(() => {
    clearDrawing()
  }, [clearDrawing])

  const handleFinishDrawing = useCallback(() => {
    const territory = finishDrawing()
    if (territory && isFirebaseConfigured()) {
      void saveTerritoryAndUpdateUserStats(territory)
        .then(() => toast.success('Território salvo na nuvem.'))
        .catch(() => toast.error('Não foi possível salvar o território.'))
    }
  }, [finishDrawing])

  return (
    <>
      {/* Bottom center - Drawing controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
        {!isDrawing ? (
          <Button
            onClick={handleStartDrawing}
            className="h-14 px-8 font-semibold text-base shadow-lg glow-lime"
            style={{
              background: '#CCFF00',
              color: '#19305A',
            }}
          >
            <Pencil className="h-5 w-5 mr-2" />
            Desenhar Territorio
          </Button>
        ) : (
          <div 
            className="flex items-center gap-2 p-2 backdrop-blur-sm rounded-2xl shadow-lg border"
            style={{
              background: 'rgba(25, 48, 90, 0.95)',
              borderColor: '#2d4a70'
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-xl hover:bg-[#FF4D4D]/10"
              style={{ color: '#FF4D4D' }}
              onClick={handleCancelDrawing}
            >
              <X className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-xl hover:bg-[#243a5e]"
              onClick={removeLastDrawingPoint}
              disabled={!canUndo}
            >
              <Undo2 className="h-5 w-5" />
            </Button>

            <div 
              className="h-8 w-px"
              style={{ background: '#2d4a70' }}
            />

            <div className="px-4 text-center min-w-[100px]">
              <div 
                className="text-lg font-mono font-bold"
                style={{ color: '#CCFF00' }}
              >
                {drawingPoints.length}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {canFinish ? 'Pronto' : 'Min. 3 pts'}
              </div>
            </div>

            <div 
              className="h-8 w-px"
              style={{ background: '#2d4a70' }}
            />

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-12 w-12 rounded-xl',
                canFinish
                  ? 'hover:bg-[#CCFF00]/10'
                  : 'opacity-50 cursor-not-allowed'
              )}
              style={{ color: canFinish ? '#CCFF00' : '#8ba3c7' }}
              onClick={handleFinishDrawing}
              disabled={!canFinish}
            >
              <Check className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>

      {/* Drawing mode indicator */}
      {isDrawing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
          <div 
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium shadow-lg"
            style={{
              background: 'rgba(204, 255, 0, 0.95)',
              color: '#19305A'
            }}
          >
            <MapPin className="h-4 w-4" />
            Clique no mapa para adicionar pontos
          </div>
        </div>
      )}

      {/* Points indicator while drawing */}
      {isDrawing && drawingPoints.length > 0 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000]">
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs shadow-lg"
            style={{
              background: 'rgba(25, 48, 90, 0.9)',
              border: '1px solid #2d4a70'
            }}
          >
            <Eye className="h-3 w-3 text-[#00D2FF]" />
            <span className="text-muted-foreground">
              {drawingPoints.length < 3 
                ? `Adicione mais ${3 - drawingPoints.length} ponto${3 - drawingPoints.length > 1 ? 's' : ''}`
                : 'Clique no botao verde para finalizar'
              }
            </span>
          </div>
        </div>
      )}
    </>
  )
})
