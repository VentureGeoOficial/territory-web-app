'use client'

import { useEffect, useState } from 'react'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { subscribeAcceptedFriends } from '@/lib/services/friends-service'
import { useAuthStore } from '@/lib/store/auth-store'

/** IDs de utilizadores com amizade aceite (subscrição em tempo real). */
export function useFriendIds(): string[] {
  const uid = useAuthStore((s) => s.user?.id)
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    if (!uid || !isFirebaseConfigured()) {
      setIds([])
      return
    }
    const unsub = subscribeAcceptedFriends(uid, setIds)
    return () => unsub?.()
  }, [uid])

  return ids
}
