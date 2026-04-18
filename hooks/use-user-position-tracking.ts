'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRunStore } from '@/lib/store/run-store'
import { probeGeolocationPermission } from '@/lib/services/location-service'

/**
 * Hook para rastrear a posição do usuário continuamente,
 * independente de estar correndo ou não.
 */
export function useUserPositionTracking() {
  const watchIdRef = useRef<number | null>(null)
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

    // Se já está rastreando, não inicia novamente
    if (watchIdRef.current !== null) return

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
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

  return {
    startTracking,
    stopTracking,
  }
}
