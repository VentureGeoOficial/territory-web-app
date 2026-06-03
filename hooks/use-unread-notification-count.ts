'use client'

import { useEffect, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase/client'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { USER_NOTIFICATIONS_SUBCOLLECTION } from '@/lib/firebase/notifications'
import {
  countUnreadNotifications,
  presentNotification,
} from '@/lib/notifications/notification-presenter'
import { useAuthStore } from '@/lib/store/auth-store'

const UNREAD_SCAN_LIMIT = 50

export function useUnreadNotificationCount(): number {
  const uid = useAuthStore((s) => s.user?.id)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!uid || !isFirebaseConfigured()) {
      setCount(0)
      return
    }

    const db = getFirestoreDb()
    const q = query(
      collection(db, 'users', uid, USER_NOTIFICATIONS_SUBCOLLECTION),
      orderBy('createdAt', 'desc'),
      limit(UNREAD_SCAN_LIMIT),
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((doc) =>
          presentNotification(doc.id, doc.data() as Record<string, unknown>),
        )
        setCount(countUnreadNotifications(items))
      },
      () => setCount(0),
    )

    return () => unsub()
  }, [uid])

  return count
}
