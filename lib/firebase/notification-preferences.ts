import type { NotificationPreferencesValues } from '@/lib/auth/schemas'
import { updateNotificationPreferences } from '@/lib/firebase/user-profile'

export async function saveNotificationPreferences(
  uid: string,
  values: NotificationPreferencesValues,
): Promise<void> {
  await updateNotificationPreferences(uid, values)
}
