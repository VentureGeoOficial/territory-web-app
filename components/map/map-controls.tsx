'use client'

import { memo, useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useTerritoryStore } from '@/lib/store/territory-store'
import { useRunStore } from '@/lib/store/run-store'
import { useAuthStore } from '@/lib/store/auth-store'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { createTerritoryFromRunTrack } from '@/lib/territory/run-territory'
import { generateId, trackPointsToPositions } from '@/lib/territory/geo'
import { saveCompletedRun } from '@/lib/firebase/run-completion'
import { useRunSession } from '@/hooks/use-run-session'
import { getCurrentPositionOnce } from '@/lib/services/location-service'
import { getUserProfile } from '@/lib/firebase/user-profile'
import { Play, Square, X, MapPin, Loader2 } from 'lucide-react'
import { formatDistance, formatDuration } from '@/lib/territory/geo'

const BRAND = {
  lime: '#CCFF00',
  navy: '#19305A',
  border: '#2d4a70',
}

export const MapControlsOverlay = memo(function MapControlsOverlay() {
  const user = useAuthStore((s) => s.user)
  const currentUserId = useTerritoryStore((s) => s.currentUserId)
  const territories = useTerritoryStore((s) => s.territories)
  const getCurrentUser = useTerritoryStore((s) => s.getCurrentUser)
  const setMapMode = useTerritoryStore((s) => s.setMapMode)

  const isRunning = useRunStore((s) => s.isRunning)
  const points = useRunStore((s) => s.points)
  const distanceMeters = useRunStore((s) => s.distanceMeters)
  const startedAt = useRunStore((s) => s.startedAt)
  const resetRunState = useRunStore((s) => s.resetRunState)

  const {
    permission,
    setPermission,
    startRun,
    cancelRun,
    stopWatching,
  } = useRunSession()

  const [finishing, setFinishing] = useState(false)
  const [liveSeconds, setLiveSeconds] = useState(0)

  useEffect(() => {
    if (!isRunning || !startedAt) {
      setLiveSeconds(0)
      return
    }
    const t = setInterval(() => {
      setLiveSeconds(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => clearInterval(t)
  }, [isRunning, startedAt])

  const requestLocation = useCallback(async () => {
    try {
      await getCurrentPositionOnce()
      setPermission('granted')
    } catch {
      toast.error('Não foi possível obter a localização.')
      setPermission('denied')
    }
  }, [setPermission])

  const handleStart = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      toast.error('Configure o Firebase para iniciar uma corrida.')
      return
    }
    if (permission === 'unsupported') {
      toast.error('Geolocalização não disponível neste dispositivo.')
      return
    }
    if (permission === 'denied') {
      toast.error('Permita o acesso à localização nas definições do navegador.')
      return
    }
    if (permission === 'prompt') {
      try {
        await getCurrentPositionOnce()
        setPermission('granted')
      } catch {
        toast.error('Precisamos da sua localização para registar a corrida.')
        return
      }
    }
    startRun()
  }, [permission, setPermission, startRun])

  const handleFinish = useCallback(async () => {
    if (points.length < 2 || !startedAt) {
      toast.error('Percorra mais para gerar um território.')
      return
    }
    setFinishing(true)
    stopWatching()
    const endedAt = Date.now()
    const durationSeconds = (endedAt - startedAt) / 1000

    try {
      let currentUser = getCurrentUser()
      if (user?.id && (!currentUser?.color || currentUser.id !== user.id)) {
        const prof = await getUserProfile(user.id)
        if (prof) {
          currentUser = {
            id: user.id,
            displayName: prof.displayName,
            email: prof.email,
            color: prof.color,
            totalAreaM2: prof.totalAreaM2,
            territoriesCount: prof.territoriesCount,
            totalDistanceM: 0,
            totalDurationSeconds: 0,
            createdAt: Date.now(),
            lastActiveAt: Date.now(),
          }
        }
      }

      const { newTerritory } = createTerritoryFromRunTrack({
        points,
        currentUserId,
        currentUser,
        authDisplayName: user?.displayName,
        existingTerritories: territories,
      })

      const runId = generateId()
      const routeJson = JSON.stringify({
        type: 'LineString',
        coordinates: trackPointsToPositions(points),
      })

      await saveCompletedRun({
        territory: newTerritory,
        runId,
        userId: currentUserId,
        startedAt,
        endedAt,
        distanceMeters,
        durationSeconds,
        routeJson,
      })

      resetRunState()
      setMapMode('view')
      toast.success('Corrida concluída! Território conquistado.')
    } catch (e) {
      console.error(e)
      const msg = e instanceof Error ? e.message : 'Não foi possível salvar.'
      toast.error(msg)
      resetRunState()
      setMapMode('view')
    } finally {
      setFinishing(false)
    }
  }, [
    currentUserId,
    distanceMeters,
    getCurrentUser,
    points,
    resetRunState,
    setMapMode,
    startedAt,
    stopWatching,
    territories,
    user,
  ])

  const canStart =
    isFirebaseConfigured() &&
    permission !== 'unsupported' &&
    permission !== 'denied' &&
    !isRunning &&
    !finishing

  return (
    <>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] max-w-[95vw]">
        {!isFirebaseConfigured() && (
          <p className="text-center text-xs text-amber-400 mb-2 px-2">
            Defina NEXT_PUBLIC_FIREBASE_* no .env.local para usar o mapa com dados reais.
          </p>
        )}

        {permission === 'denied' && (
          <p className="text-center text-xs text-red-400 mb-2">
            Ative a localização nas definições do navegador para usar o TerritoryRun.
          </p>
        )}

        {permission === 'prompt' && (
          <div className="flex justify-center mb-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="gap-2"
              onClick={() => void requestLocation()}
            >
              <MapPin className="h-4 w-4" />
              Permitir localização
            </Button>
          </div>
        )}

        {!isRunning ? (
          <Button
            type="button"
            onClick={() => void handleStart()}
            disabled={!canStart}
            className="h-14 px-8 font-semibold text-base shadow-lg glow-lime w-full sm:w-auto"
            style={{
              background: canStart ? BRAND.lime : '#4a5568',
              color: '#19305A',
            }}
          >
            <Play className="h-5 w-5 mr-2" />
            Iniciar corrida
          </Button>
        ) : (
          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 backdrop-blur-sm rounded-2xl shadow-lg border"
            style={{
              background: 'rgba(25, 48, 90, 0.95)',
              borderColor: BRAND.border,
            }}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-xl hover:bg-[#FF4D4D]/10 shrink-0"
              style={{ color: '#FF4D4D' }}
              onClick={cancelRun}
              disabled={finishing}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="flex flex-1 justify-around sm:justify-center gap-4 px-2 text-center font-mono text-sm">
              <div>
                <div style={{ color: BRAND.lime }} className="font-bold text-lg">
                  {formatDistance(distanceMeters)}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase">
                  Distância
                </div>
              </div>
              <div>
                <div style={{ color: BRAND.lime }} className="font-bold text-lg">
                  {formatDuration(liveSeconds)}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase">
                  Tempo
                </div>
              </div>
              <div>
                <div style={{ color: BRAND.lime }} className="font-bold text-lg">
                  {points.length}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase">
                  Pontos
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="h-12 px-4 rounded-xl gap-2 shrink-0"
              style={{ color: BRAND.lime }}
              onClick={() => void handleFinish()}
              disabled={finishing}
            >
              {finishing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Square className="h-5 w-5 fill-current" />
              )}
              Finalizar
            </Button>
          </div>
        )}
      </div>

      {isRunning && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
          <div
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium shadow-lg"
            style={{
              background: 'rgba(204, 255, 0, 0.95)',
              color: '#19305A',
            }}
          >
            <MapPin className="h-4 w-4" />
            A registar o seu percurso em Suzano
          </div>
        </div>
      )}
    </>
  )
})
