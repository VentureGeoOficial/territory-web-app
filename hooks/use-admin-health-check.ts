'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { isFirebaseConfigured } from '@/lib/firebase/config'

/**
 * Avisa uma vez se FIREBASE_SERVICE_ACCOUNT_JSON não está configurado no servidor.
 */
export function useAdminHealthCheck() {
  const warned = useRef(false)

  useEffect(() => {
    if (!isFirebaseConfigured() || warned.current) return

    void (async () => {
      try {
        const res = await fetch('/api/health/admin')
        if (res.ok) return
        warned.current = true
        toast.warning(
          'Servidor sem credencial Admin. Adicione FIREBASE_SERVICE_ACCOUNT_JSON no .env.local para salvar territórios.',
          { duration: 8000 },
        )
      } catch {
        // rede / servidor indisponível — ignorar
      }
    })()
  }, [])
}
