/**
 * Façade social / amigos: UI importa apenas este módulo; a persistência continua em `lib/firebase/friends`.
 */
export {
  acceptFriendRequest,
  cancelFriendRequest,
  FRIEND_USERNAME_SLUG_PATTERN,
  lookupFriendUid,
  rejectFriendRequest,
  sendFriendRequest,
  subscribeAcceptedFriends,
  subscribeFriendRequests,
  validateNoExistingFriendship,
  type FriendRequestDoc,
  type LookupFriendUidResult,
  type ValidateFriendshipResult,
} from '@/lib/firebase/friends'

export { getPublicProfileSummary } from '@/lib/firebase/user-profile'
