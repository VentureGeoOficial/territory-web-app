'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRunStore } from '@/lib/store/run-store'
import { probeGeolocationPermission } from '@/lib/services/location-service'

/** Intervalo mínimo entre actualizações da posição “idle” (reduz re-renders / CPU). */
const IDLE_POSITION_MIN_MS = 2500

/**
 * Hook para rastrear a posição do usuário continuamente quando não está em corrida;
 * durante corrida usa apenas `watchRunTrack` em useRunSession (evita dois watchPosition).
 */
export function useUserPositionTracking() {
  const watchIdRef = useRef<number | null>(null)
  const lastIdleEmitRef = useRef(0)
  const permission = useRunStore((s) => s.permission)
  const setPermission = useRunStore((s) => s.setPermission)
  const setCurrentUserPosition = useRunStore((s) => s.setCurrentUserPosition)
  const setIsTrackingPosition = useRunStore((s) => s.setIsTrackingPosition)
  const isRunning = useRunStore((s) => s.isRunning)

  const startTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setPermission('unsupported')
      return
    }

    // Durante corrida o percurso é o watchRunTrack — não duplicar GPS idle.
    if (useRunStore.getState().isRunning) return

    // Se já está rastreando, não inicia novamente
    if (watchIdRef.current !== null) return

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now()
        if (now - lastIdleEmitRef.current < IDLE_POSITION_MIN_MS) return
        lastIdleEmitRef.current = now
        const { latitude, longitude } = position.coords
        setCurrentUserPosition(latitude, longitude)
        setIsTrackingPosition(true)
      },
      (error) => {
        // Erro silencioso - usuário negou permissão ou outro erro
        if (error.code === 1) {
          setPermission('denied')
        }
        setIsTrackingPosition(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    )
  }, [setCurrentUserPosition, setIsTrackingPosition, setPermission])

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
      setIsTrackingPosition(false)
    }
  }, [setIsTrackingPosition])

  // Verifica permissão e inicia tracking quando possível
  useEffect(() => {
    void (async () => {
      const p = await probeGeolocationPermission()
      if (p === 'unsupported') {
        setPermission('unsupported')
        return
      }
      if (p === 'denied') {
        setPermission('denied')
        return
      }
      if (p === 'granted') {
        setPermission('granted')
        startTracking()
      } else {
        setPermission('prompt')
      }
    })()

    return () => {
      stopTracking()
    }
  }, [setPermission, startTracking, stopTracking])

  // Reinicia tracking quando permissão é concedida
  useEffect(() => {
    if (permission === 'granted' && watchIdRef.current === null && !isRunning) {
      startTracking()
    }
  }, [permission, isRunning, startTracking])

  // Para o watch “idle” durante corrida; volta quando termina (um único GPS activo).
  useEffect(() => {
    if (isRunning) {
      stopTracking()
    } else if (permission === 'granted') {
      startTracking()
    }
  }, [isRunning, permission, startTracking, stopTracking])

  return {
    startTracking,
    stopTracking,
  }
}
