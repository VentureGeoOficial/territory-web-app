'use client'

import { useFirestoreTerritorySync } from '@/hooks/use-firestore-territory-sync'
import { useCurrentUserPublicProfile } from '@/hooks/use-public-profile-sync'
import { useUserPositionTracking } from '@/hooks/use-user-position-tracking'
import { useAuthStore } from '@/lib/store/auth-store'
import { Header } from '@/components/layout/header'
import { TerritorySidebar } from '@/components/territory/territory-sidebar'
import { MapWrapper } from '@/components/map/map-wrapper'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { useFriendIds } from '@/hooks/use-friend-ids'

export default function MapaPage() {
  const uid = useAuthStore((s) => s.user?.id)
  const friendIds = useFriendIds()
  useFirestoreTerritorySync()
  useCurrentUserPublicProfile(uid)
  useUserPositionTracking()

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden pb-14 lg:pb-0">
        <div className="hidden lg:block h-full">
          <TerritorySidebar />
        </div>
        <main className="flex-1 relative min-w-0">
          <MapWrapper friendIds={friendIds} />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
