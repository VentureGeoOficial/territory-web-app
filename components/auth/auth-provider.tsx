'use client'

import * as React from 'react'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { useAuthStore } from '@/lib/store/auth-store'
import { useTerritoryStore } from '@/lib/store/territory-store'
import { log } from '@/lib/logging/logger'

type AuthReadyValue = { firebaseAuthReady: boolean }

export const AuthReadyContext = React.createContext<AuthReadyValue>({
  firebaseAuthReady: true,
})

/**
 * Mantém Zustand alinhado ao Firebase Auth quando o projeto está configurado.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession)
  const logout = useAuthStore((s) => s.logout)
  const setCurrentUserId = useTerritoryStore((s) => s.setCurrentUserId)
  const [firebaseAuthReady, setFirebaseAuthReady] = React.useState(
    !isFirebaseConfigured(),
  )

  React.useEffect(() => {
    if (!isFirebaseConfigured()) {
      setFirebaseAuthReady(true)
      return
    }

    let unsubAuth: (() => void) | undefined
    let unsubToken: (() => void) | undefined

    void (async () => {
      const { onAuthStateChanged, onIdTokenChanged } = await import('firebase/auth')
      const { getFirebaseAuth } = await import('@/lib/firebase/client')
      const { firebaseUserToSession } = await import('@/lib/auth/firebase-session')
      const { ensureUserProfile, getUserProfile } = await import(
        '@/lib/firebase/user-profile'
      )

      const auth = getFirebaseAuth()

      const applyUser = async (user: import('firebase/auth').User | null) => {
        setFirebaseAuthReady(true)
        if (user) {
          const session = await firebaseUserToSession(user)
          setSession(session)
          setCurrentUserId(user.uid)

          const profile = await getUserProfile(user.uid)
          if (!profile) {
            log.critical({
              scope: 'auth',
              event: 'auth_phantom_user_detected',
              uid: user.uid,
            })
          }

          try {
            await ensureUserProfile(user.uid, {
              email: session.user.email,
              displayName: session.user.displayName,
            })
          } catch (e) {
            log.warn({
              scope: 'auth',
              event: 'auth_ensure_profile_failed',
              uid: user.uid,
              message: e instanceof Error ? e.message : String(e),
            })
          }
        } else {
          logout()
          setCurrentUserId('')
        }
      }

      unsubAuth = onAuthStateChanged(auth, (user) => {
        void applyUser(user)
      })

      unsubToken = onIdTokenChanged(auth, (user) => {
        if (!user) return
        void firebaseUserToSession(user).then((session) => {
          setSession(session)
        })
      })
    })()

    return () => {
      unsubAuth?.()
      unsubToken?.()
    }
  }, [setSession, logout, setCurrentUserId])

  return (
    <AuthReadyContext.Provider value={{ firebaseAuthReady }}>
      {children}
    </AuthReadyContext.Provider>
  )
}
