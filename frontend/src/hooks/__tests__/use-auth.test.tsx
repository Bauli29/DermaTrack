import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { AuthContext } from '@/context/auth'
import { AUTH_CONTEXT_DEFAULT_VALUE } from '@/context/auth/types'
import { useAuth } from '@/hooks/use-auth'

describe('useAuth', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('returns the auth context value', () => {
    const Probe = () => {
      const { isLoggedIn, user } = useAuth()
      return <span>{`${isLoggedIn}:${user?.username ?? 'none'}`}</span>
    }

    act(() => {
      root.render(
        <AuthContext.Provider
          value={{
            ...AUTH_CONTEXT_DEFAULT_VALUE,
            isLoggedIn: true,
            user: {
              id: 'user-id',
              username: 'alice',
              email: 'alice@example.com',
              createdAt: '2026-05-30T00:00:00Z',
            },
          }}
        >
          <Probe />
        </AuthContext.Provider>
      )
    })

    expect(container.textContent).toBe('true:alice')
  })

  it('throws when the context value is missing', () => {
    const Probe = () => {
      useAuth()
      return null
    }

    expect(() => {
      act(() => {
        root.render(
          <AuthContext.Provider value={undefined as never}>
            <Probe />
          </AuthContext.Provider>
        )
      })
    }).toThrow('useAuth must be used within an AuthContextProvider')
  })
})
