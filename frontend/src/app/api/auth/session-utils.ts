import type { ISessionResponse, IUser } from '@/types/auth'

const createPlaceholderUser = (username: string): IUser => ({
  id: '',
  username,
  email: '',
  createdAt: '',
})

export const createAuthenticatedSessionResponse = (
  username: string
): ISessionResponse => ({
  isLoggedIn: true,
  user: createPlaceholderUser(username),
})

export const createUnauthenticatedSessionResponse = (): ISessionResponse => ({
  isLoggedIn: false,
  user: null,
})
