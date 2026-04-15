import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthSession, AuthUser } from '@/lib/auth/types'

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  setSession: (session: AuthSession) => void
  logout: () => void
}

const initial: Pick<
  AuthState,
  'user' | 'accessToken' | 'refreshToken' | 'expiresAt'
> = {
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initial,
      setSession: (session) =>
        set({
          user: session.user,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          expiresAt: session.expiresAt,
        }),
      logout: () => set({ ...initial }),
    }),
    {
      name: 'territoryrun-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
      }),
    },
  ),
)

export function selectIsAuthenticated(state: AuthState): boolean {
  return Boolean(state.user && state.accessToken)
}
