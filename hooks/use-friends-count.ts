'use client'

import { useFriendIds } from '@/hooks/use-friend-ids'

export function useFriendsCount() {
  const ids = useFriendIds()
  return ids.length
}
