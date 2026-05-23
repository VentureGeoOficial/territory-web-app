import type { ReactNode } from 'react'

import { AuthGuard } from '@/components/auth/auth-guard'
import { EmailVerificationBanner } from '@/components/auth/email-verification-banner'
import { AppRatingHost } from '@/components/feedback/app-rating-host'

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="px-4 pt-4">
        <EmailVerificationBanner />
      </div>
      {children}
      <AppRatingHost />
    </AuthGuard>
  )
}
