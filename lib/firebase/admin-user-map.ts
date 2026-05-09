import 'server-only'

import type { User } from '@/lib/territory/types'

export function firestoreUserDocToDomainUser(
  uid: string,
  data: Record<string, unknown>,
): User {
  return {
    id: uid,
    displayName: String(data.displayName ?? 'Corredor'),
    email: data.email !== undefined ? String(data.email) : undefined,
    color: String(data.color ?? '#CCFF00'),
    totalAreaM2: Number(data.totalAreaM2 ?? 0),
    territoriesCount: Number(data.territoriesCount ?? 0),
    totalDistanceM: Number(data.totalDistanceM ?? 0),
    totalDurationSeconds: Number(data.totalDurationSeconds ?? 0),
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  }
}
