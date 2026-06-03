'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase/client'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { USER_NOTIFICATIONS_SUBCOLLECTION } from '@/lib/firebase/notifications'
import {
  presentNotification,
  type PresentedNotification,
} from '@/lib/notifications/notification-presenter'
import { useAuthStore } from '@/lib/store/auth-store'

const PAGE_SIZE = 20

export interface UseNotificationInboxResult {
  items: PresentedNotification[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  error: string | null
  loadMore: () => Promise<void>
  markItemReadLocally: (id: string) => void
}

export function useNotificationInbox(): UseNotificationInboxResult {
  const uid = useAuthStore((s) => s.user?.id)
  const [items, setItems] = useState<PresentedNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null)

  const markItemReadLocally = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    )
  }, [])

  useEffect(() => {
    if (!uid || !isFirebaseConfigured()) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setLastDoc(null)

    const db = getFirestoreDb()
    const q = query(
      collection(db, 'users', uid, USER_NOTIFICATIONS_SUBCOLLECTION),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE),
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map((doc) =>
          presentNotification(doc.id, doc.data() as Record<string, unknown>),
        )
        setItems(next)
        setLastDoc(snap.docs[snap.docs.length - 1] ?? null)
        setHasMore(snap.docs.length >= PAGE_SIZE)
        setLoading(false)
      },
      (err) => {
        console.error('[useNotificationInbox]', err)
        setError('Não foi possível carregar as notificações.')
        setLoading(false)
      },
    )

    return () => unsub()
  }, [uid])

  const loadMore = useCallback(async () => {
    if (!uid || !isFirebaseConfigured() || !lastDoc || loadingMore || !hasMore) {
      return
    }

    setLoadingMore(true)
    try {
      const db = getFirestoreDb()
      const q = query(
        collection(db, 'users', uid, USER_NOTIFICATIONS_SUBCOLLECTION),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE),
      )
      const snap = await getDocs(q)
      const more = snap.docs.map((doc) =>
        presentNotification(doc.id, doc.data() as Record<string, unknown>),
      )
      setItems((prev) => {
        const seen = new Set(prev.map((item) => item.id))
        const merged = [...prev]
        for (const item of more) {
          if (!seen.has(item.id)) merged.push(item)
        }
        return merged
      })
      setLastDoc(snap.docs[snap.docs.length - 1] ?? lastDoc)
      setHasMore(snap.docs.length >= PAGE_SIZE)
    } catch (err) {
      console.error('[useNotificationInbox.loadMore]', err)
      setError('Não foi possível carregar mais notificações.')
    } finally {
      setLoadingMore(false)
    }
  }, [uid, lastDoc, loadingMore, hasMore])

  return useMemo(
    () => ({
      items,
      loading,
      loadingMore,
      hasMore,
      error,
      loadMore,
      markItemReadLocally,
    }),
    [items, loading, loadingMore, hasMore, error, loadMore, markItemReadLocally],
  )
}
