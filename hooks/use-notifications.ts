'use client'

import { useEffect, useRef } from 'react'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { toast } from 'sonner'
import { getFirestoreDb } from '@/lib/firebase/client'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { USER_NOTIFICATIONS_SUBCOLLECTION } from '@/lib/firebase/notifications'
import type { TerritoryCapturedNotificationDoc } from '@/lib/firebase/notifications'
import { useAuthStore } from '@/lib/store/auth-store'

/**
 * Escuta notificações in-app do utilizador autenticado e exibe toast para novas capturas.
 */
export function useNotificationsListener(): void {
  const uid = useAuthStore((s) => s.user?.id)
  const seenIdsRef = useRef<Set<string>>(new Set())
  const initialLoadRef = useRef(true)

  useEffect(() => {
    if (!uid || !isFirebaseConfigured()) return

    const db = getFirestoreDb()
    const q = query(
      collection(db, 'users', uid, USER_NOTIFICATIONS_SUBCOLLECTION),
      orderBy('createdAt', 'desc'),
      limit(20),
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        if (initialLoadRef.current) {
          for (const doc of snap.docs) {
            seenIdsRef.current.add(doc.id)
          }
          initialLoadRef.current = false
          return
        }

        for (const change of snap.docChanges()) {
          if (change.type !== 'added') continue
          const id = change.doc.id
          if (seenIdsRef.current.has(id)) continue
          seenIdsRef.current.add(id)

          const data = change.doc.data() as TerritoryCapturedNotificationDoc
          if (data.type !== 'territory_captured') continue

          toast.info(data.message, {
            description: `${data.actorName} enviou ${data.reactionEmoji}`,
            duration: 8000,
          })
        }
      },
      (err) => {
        console.error('[useNotificationsListener]', err)
        toast.error(
          'Não foi possível carregar notificações. Verifique se as regras e índices do Firebase estão publicados.',
          { duration: 6000 },
        )
      },
    )

    return () => {
      unsub()
      seenIdsRef.current.clear()
      initialLoadRef.current = true
    }
  }, [uid])
}
