/**
 * Authentication domain types
 * Central contract for all auth-related data structures
 */

/**
 * User profile returned from backend after login/register
 */
export interface IUser {
  id: string
  username: string
  email: string
  createdAt: string
}

/**
 * Session contract returned by the frontend auth session route
 */
export interface ISessionResponse {
  isLoggedIn: boolean
  user: IUser | null
}

/**
 * Token pair returned from backend on successful login/register
 * Both tokens are JWT signed by backend
 */
export interface IAuthResponse {
  accessToken: string
  refreshToken: string
}

/**
 * JWT payload structure (decoded from token)
 * Used internally to check expiration and extract user info
 */
export interface ITokenPayload {
  sub: string // username (subject)
  iat: number // issued at (seconds since epoch)
  exp: number // expiration (seconds since epoch)
}

/**
 * Login request contract
 */
export interface ILoginRequest {
  username: string
  password: string
}

/**
 * Register request contract
 */
export interface IRegisterRequest {
  username: string
  email: string
  password: string
}

/**
 * Refresh token request contract
 */
export interface IRefreshRequest {
  refreshToken: string
}

/**
 * Auth context state exposed to components
 */
export interface IAuthContextState {
  user: IUser | null
  isLoggedIn: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Auth context methods exposed to components
 */
export interface IAuthContextActions {
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refetch: () => Promise<void> // Re-validate session
  clearError: () => void
}

/**
 * Complete auth context contract
 */
export interface IAuthContext extends IAuthContextState, IAuthContextActions {}
