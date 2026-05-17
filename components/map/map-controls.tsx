'use client'

import { memo, useCallback, useContext, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useTerritoryStore } from '@/lib/store/territory-store'
import { useRunStore } from '@/lib/store/run-store'
import { useAuthStore } from '@/lib/store/auth-store'
import { AuthReadyContext } from '@/components/auth/auth-provider'
import { getFirebaseAuth } from '@/lib/firebase/client'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { createTerritoryFromRunTrack } from '@/lib/territory/run-territory'
import {
  calculateCaptureImpact,
  hasEnemyCaptureOverlap,
} from '@/lib/territory/geoLogic'
import type { CaptureImpactOk } from '@/lib/territory/geoLogic'
import { trackPointsToPositions } from '@/lib/territory/geo'
import {
  submitCompletedRunViaApi,
  submitTerritoryCaptureViaApi,
} from '@/lib/firebase/run-completion'
import { CaptureXpDialog } from '@/components/map/capture-xp-dialog'
import { CaptureTransactionSkeleton } from '@/components/ui/skeletons'
import { useRunSession } from '@/hooks/use-run-session'
import { getCurrentPositionOnce } from '@/lib/services/location-service'
import { getUserProfile } from '@/lib/services/account-settings-service'
import { Play, Square, X, MapPin, Loader2 } from 'lucide-react'
import { formatDistance, formatDuration } from '@/lib/territory/geo'

const BRAND = {
  lime: '#CCFF00',
  electric: '#00D2FF',
  navy: '#19305A',
  border: '#2d4a70',
}

export const MapControlsOverlay = memo(function MapControlsOverlay() {
  const { firebaseAuthReady } = useContext(AuthReadyContext)
  const user = useAuthStore((s) => s.user)
  const currentUserId = useTerritoryStore((s) => s.currentUserId)
  const territories = useTerritoryStore((s) => s.territories)
  const getCurrentUser = useTerritoryStore((s) => s.getCurrentUser)
  const setMapMode = useTerritoryStore((s) => s.setMapMode)
  const selectTerritory = useTerritoryStore((s) => s.selectTerritory)

  const isRunning = useRunStore((s) => s.isRunning)
  const points = useRunStore((s) => s.points)
  const distanceMeters = useRunStore((s) => s.distanceMeters)
  const startedAt = useRunStore((s) => s.startedAt)
  const resetRunState = useRunStore((s) => s.resetRunState)
  const isPausedDueToSpeed = useRunStore((s) => s.isPausedDueToSpeed)

  const {
    permission,
    setPermission,
    startRun,
    cancelRun,
    stopWatching,
  } = useRunSession()

  const [finishing, setFinishing] = useState(false)
  const [liveSeconds, setLiveSeconds] = useState(0)
  const [captureDraft, setCaptureDraft] = useState<{
    impact: CaptureImpactOk
    newTerritoryAreaM2: number
    startedAt: number
    endedAt: number
    distanceMeters: number
    durationSeconds: number
  } | null>(null)
  const [captureLoading, setCaptureLoading] = useState(false)

  const ensureReadyForApiSave = useCallback((): boolean => {
    if (!firebaseAuthReady) {
      toast.error('A restaurar sessão… Tente novamente em instantes.')
      return false
    }
    if (!getFirebaseAuth().currentUser) {
      toast.error('Inicie sessão novamente.')
      return false
    }
    return true
  }, [firebaseAuthReady])

  useEffect(() => {
    if (!isRunning || !startedAt) {
      setLiveSeconds(0)
      return
    }
    const tick = () => {
      const rs = useRunStore.getState()
      const openPause =
        rs.isPausedDueToSpeed && rs.speedPauseSegmentStartedAt != null
          ? Date.now() - rs.speedPauseSegmentStartedAt
          : 0
      const totalPause = rs.accumulatedSpeedPauseMs + openPause
      const sec = Math.max(
        0,
        Math.floor((Date.now() - startedAt - totalPause) / 1000),
      )
      setLiveSeconds(sec)
    }
    tick()
    const t = setInterval(tick, 1000)
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

  const handleConfirmCapture = useCallback(async () => {
    if (!captureDraft) return
    const pts = useRunStore.getState().points
    if (pts.length < 2) {
      toast.error('Dados da corrida em falta.')
      return
    }
    if (!ensureReadyForApiSave()) return

    setCaptureLoading(true)
    try {
      const routeJson = JSON.stringify({
        type: 'LineString',
        coordinates: trackPointsToPositions(pts),
      })
      const { territoryId } = await submitTerritoryCaptureViaApi({
        points: pts,
        startedAt: captureDraft.startedAt,
        endedAt: captureDraft.endedAt,
        distanceMeters: captureDraft.distanceMeters,
        durationSeconds: captureDraft.durationSeconds,
        routeJson,
      })
      selectTerritory(territoryId)
      setCaptureDraft(null)
      resetRunState()
      setMapMode('view')
      toast.success('Conquista inimiga concluída!')
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : 'Erro ao conquistar.')
    } finally {
      setCaptureLoading(false)
    }
  }, [
    captureDraft,
    ensureReadyForApiSave,
    resetRunState,
    selectTerritory,
    setMapMode,
  ])

  const handleFinish = useCallback(async () => {
    if (points.length < 2 || !startedAt) {
      toast.error('Percorra mais para gerar um território.')
      return
    }
    setFinishing(true)
    stopWatching()
    const endedAt = Date.now()
    const rs = useRunStore.getState()
    const openPauseMs =
      rs.isPausedDueToSpeed && rs.speedPauseSegmentStartedAt != null
        ? endedAt - rs.speedPauseSegmentStartedAt
        : 0
    const totalPauseMs = rs.accumulatedSpeedPauseMs + openPauseMs
    const durationSeconds = Math.max(
      0,
      (endedAt - startedAt - totalPauseMs) / 1000,
    )

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

      const impact = calculateCaptureImpact(
        newTerritory.polygon,
        territories,
        currentUserId,
      )

      const enemyOverlap = hasEnemyCaptureOverlap(
        newTerritory.polygon,
        territories,
        currentUserId,
      )

      if (enemyOverlap) {
        if (!impact.ok) {
          toast.error(impact.message)
          resetRunState()
          setMapMode('view')
          return
        }
        setCaptureDraft({
          impact,
          newTerritoryAreaM2: newTerritory.areaM2,
          startedAt,
          endedAt,
          distanceMeters,
          durationSeconds,
        })
        return
      }

      const routeJson = JSON.stringify({
        type: 'LineString',
        coordinates: trackPointsToPositions(points),
      })

      if (!ensureReadyForApiSave()) {
        setFinishing(false)
        return
      }

      const { territoryId } = await submitCompletedRunViaApi({
        points,
        startedAt,
        endedAt,
        distanceMeters,
        durationSeconds,
        routeJson,
      })

      selectTerritory(territoryId)
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
    ensureReadyForApiSave,
    getCurrentUser,
    points,
    resetRunState,
    selectTerritory,
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
      <CaptureXpDialog
        open={captureDraft !== null}
        onOpenChange={(open) => {
          if (!open && !captureLoading) {
            setCaptureDraft(null)
            resetRunState()
            setMapMode('view')
          }
        }}
        impact={captureDraft?.impact ?? null}
        distanceMeters={captureDraft?.distanceMeters ?? 0}
        newTerritoryAreaM2={captureDraft?.newTerritoryAreaM2 ?? 0}
        onConfirm={handleConfirmCapture}
        loading={captureLoading}
      />

      {captureLoading && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <CaptureTransactionSkeleton />
        </div>
      )}

      <div className="pointer-events-none absolute bottom-[5.75rem] left-3 z-[999] max-w-[min(14rem,calc(100vw-1.5rem))] hidden md:block">
        <div
          className="pointer-events-auto rounded-lg border px-3 py-2 text-[11px] bg-background/90 backdrop-blur-sm text-muted-foreground space-y-1.5 shadow-md"
          style={{ borderColor: BRAND.border }}
        >
          <div className="font-semibold text-foreground text-xs">Legenda</div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm shrink-0 border border-white/20"
              style={{ background: BRAND.lime }}
            />
            Os seus territórios
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm shrink-0 border border-dashed border-white/35"
              style={{ background: `${BRAND.electric}55` }}
            />
            Amigo (contorno tracejado no mapa)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm shrink-0 bg-muted border border-border" />
            Outros jogadores
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] max-w-[95vw]">
        {!isFirebaseConfigured() && (
          <p className="text-center text-xs text-amber-400 mb-2 px-2">
            Defina NEXT_PUBLIC_FIREBASE_* nas variáveis de ambiente (painel Vercel) para usar o mapa com dados reais.
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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2">
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
          {isPausedDueToSpeed && (
            <div
              className="px-4 py-2 rounded-full text-xs font-medium shadow-md max-w-[90vw] text-center"
              style={{
                background: 'rgba(255, 77, 77, 0.95)',
                color: '#fff',
              }}
            >
              Velocidade elevada — progresso em pausa (limite 24 km/h)
            </div>
          )}
        </div>
      )}
    </>
  )
})
