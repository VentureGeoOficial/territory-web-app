'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useRunStore } from '@/lib/store/run-store'
import { useTerritoryStore } from '@/lib/store/territory-store'
import {
  clearWatch,
  probeGeolocationPermission,
  watchRunTrack,
} from '@/lib/services/location-service'
import { SpeedGate } from '@/lib/services/speed-gate'

export function useRunSession() {
  const watchIdRef = useRef<number | null>(null)
  const speedGateRef = useRef<SpeedGate | null>(null)
  const setMapMode = useTerritoryStore((s) => s.setMapMode)
  const permission = useRunStore((s) => s.permission)
  const setPermission = useRunStore((s) => s.setPermission)
  const isRunning = useRunStore((s) => s.isRunning)
  const startRunStore = useRunStore((s) => s.startRun)
  const cancelRunStore = useRunStore((s) => s.cancelRun)
  const resetRunState = useRunStore((s) => s.resetRunState)
  const appendTrackPoint = useRunStore((s) => s.appendTrackPoint)
  const setLivePosition = useRunStore((s) => s.setLivePosition)

  useEffect(() => {
    void (async () => {
      const p = await probeGeolocationPermission()
      if (p === 'unsupported') setPermission('unsupported')
      else if (p === 'denied') setPermission('denied')
      else if (p === 'granted') setPermission('granted')
      else setPermission('prompt')
    })()
  }, [setPermission])

  const setCurrentUserPosition = useRunStore((s) => s.setCurrentUserPosition)
  const setSpeedPaused = useRunStore((s) => s.setSpeedPaused)

  const startRun = useCallback(() => {
    const gate = new SpeedGate({ maxAccuracyM: 65 })
    speedGateRef.current = gate
    startRunStore()
    setMapMode('run')
    watchIdRef.current = watchRunTrack({
      minIntervalMs: 1500,
      minDistanceM: 6,
      maxAccuracyM: 65,
      gate,
      onSpeedPauseChange: (paused) => {
        setSpeedPaused(paused)
      },
      onPoint: (tp) => {
        appendTrackPoint(tp)
        setLivePosition(tp.latitude, tp.longitude)
        setCurrentUserPosition(tp.latitude, tp.longitude)
      },
      onLivePosition: (lat, lng) => {
        setLivePosition(lat, lng)
        setCurrentUserPosition(lat, lng)
      },
      onError: (code) => {
        if (code === 1) setPermission('denied')
      },
    })
  }, [
    appendTrackPoint,
    setLivePosition,
    setCurrentUserPosition,
    setMapMode,
    setSpeedPaused,
    startRunStore,
    setPermission,
  ])

  const stopWatching = useCallback(() => {
    if (watchIdRef.current != null) {
      clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    speedGateRef.current = null
  }, [])

  const cancelRun = useCallback(() => {
    stopWatching()
    resetRunState()
    setMapMode('view')
  }, [resetRunState, setMapMode, stopWatching])

  useEffect(() => {
    return () => {
      stopWatching()
    }
  }, [stopWatching])

  return {
    permission,
    setPermission,
    isRunning,
    startRun,
    cancelRun,
    stopWatching,
  }
}
