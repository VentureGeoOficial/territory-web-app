/**
 * Façade social / amigos: UI importa apenas este módulo; a persistência continua em `lib/firebase/friends`.
 */
export {
  acceptFriendRequest,
  cancelFriendRequest,
  lookupFriendUid,
  rejectFriendRequest,
  sendFriendRequest,
  subscribeAcceptedFriends,
  subscribeFriendRequests,
  type FriendRequestDoc,
} from '@/lib/firebase/friends'

export { getPublicProfileSummary } from '@/lib/firebase/user-profile'
