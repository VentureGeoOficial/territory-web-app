'use client'

import * as React from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/components/auth/auth-provider'
import { registerServiceWorker } from '@/lib/pwa/register-sw'

export function Providers({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    registerServiceWorker()
  }, [])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      forcedTheme="dark"
    >
      <AuthProvider>{children}</AuthProvider>
      <Toaster position="top-center" richColors closeButton />
    </ThemeProvider>
  )
}
