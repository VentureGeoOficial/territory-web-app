import type { ReactNode } from 'react'

import { AuthGuard } from '@/components/auth/auth-guard'
import { ProfileCompleteGuard } from '@/components/auth/profile-complete-guard'
import { EmailVerificationBanner } from '@/components/auth/email-verification-banner'
import { AppRatingHost } from '@/components/feedback/app-rating-host'
import { OnboardingHost } from '@/components/onboarding/onboarding-host'
import { NotificationsHost } from '@/components/notifications/notifications-host'

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <ProfileCompleteGuard>
        <div className="px-4 pt-4">
          <EmailVerificationBanner />
        </div>
        {children}
        <NotificationsHost />
        <OnboardingHost />
        <AppRatingHost />
      </ProfileCompleteGuard>
    </AuthGuard>
  )
}
