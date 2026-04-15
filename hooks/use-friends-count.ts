'use client'

import { useEffect, useState } from 'react'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { subscribeAcceptedFriends } from '@/lib/firebase/friends'
import { useAuthStore } from '@/lib/store/auth-store'

export function useFriendsCount() {
  const uid = useAuthStore((s) => s.user?.id)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!uid || !isFirebaseConfigured()) {
      setCount(0)
      return
    }
    const unsub = subscribeAcceptedFriends(uid, (ids) => setCount(ids.length))
    return () => unsub?.()
  }, [uid])

  return count
}
