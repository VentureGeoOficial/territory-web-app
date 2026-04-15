export interface AuthUser {
  id: string
  email: string
  displayName: string
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
  refreshToken: string | null
  expiresAt: number | null
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}
