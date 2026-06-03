import { getApiAuthHeaders } from '@/lib/auth/api-auth'

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const headers = await getApiAuthHeaders()
  const res = await fetch(`/api/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'PATCH',
    headers,
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? 'Não foi possível marcar como lida.')
  }
}
