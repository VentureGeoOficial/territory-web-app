'use client'

import { useFirestoreTerritorySync } from '@/hooks/use-firestore-territory-sync'
import { useCurrentUserPublicProfile } from '@/hooks/use-public-profile-sync'
import { useUserPositionTracking } from '@/hooks/use-user-position-tracking'
import { useAuthStore } from '@/lib/store/auth-store'
import { Header } from '@/components/layout/header'
import { MapWrapper } from '@/components/map/map-wrapper'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { useFriendIds } from '@/hooks/use-friend-ids'
import { useAdminHealthCheck } from '@/hooks/use-admin-health-check'

export default function MapaPage() {
  const uid = useAuthStore((s) => s.user?.id)
  const friendIds = useFriendIds()
  useAdminHealthCheck()
  useFirestoreTerritorySync()
  useCurrentUserPublicProfile(uid)
  useUserPositionTracking()

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <main className="relative min-h-0 flex-1 overflow-hidden pb-14">
        <MapWrapper friendIds={friendIds} />
      </main>
      <MobileBottomNav />
    </div>
  )
}

