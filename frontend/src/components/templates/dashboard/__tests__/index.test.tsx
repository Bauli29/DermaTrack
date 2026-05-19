import { ReactNode } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { ThemeProvider } from 'styled-components'

import { ThemeContextProvider } from '@/context/theme'

import { useTheme } from '@/hooks/use-theme'

import { getDiaryEntries } from '@/services/diary'

import DashboardTemplate from '../'

import type { IDiaryEntry } from '@/types/diary'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/hooks/use-page-title', () => ({
  usePageTitle: jest.fn(),
}))

jest.mock('@/services/diary', () => ({
  getDiaryEntries: jest.fn(),
}))

const mockedGetDiaryEntries = getDiaryEntries as jest.MockedFunction<
  typeof getDiaryEntries
>

const mockedUseAuth = jest.requireMock('@/hooks/use-auth').useAuth as jest.Mock
const mockedUsePageTitle = jest.requireMock('@/hooks/use-page-title')
  .usePageTitle as jest.Mock

const actEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}

const createMatchMedia = () =>
  jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn().mockReturnValue(false),
  }))

const createEntry = (entryDate: string, itchiness: number): IDiaryEntry => ({
  id: `entry-${entryDate}`,
  entryDate,
  tracking: {
    psyche: {},
    contactFactors: {},
    nutrition: {},
    careProducts: {},
    health: {},
    symptoms: {
      itchiness,
    },
  },
})

describe('DashboardTemplate', () => {
  let container: HTMLDivElement
  let root: Root

  const ThemedHarness = ({ children }: { children: ReactNode }) => {
    const { theme } = useTheme()

    return <ThemeProvider theme={theme}>{children}</ThemeProvider>
  }

  const renderWithProviders = async (element: ReactNode) => {
    await act(async () => {
      root.render(
        <ThemeContextProvider>
          <ThemedHarness>{element}</ThemedHarness>
        </ThemeContextProvider>
      )
    })
  }

  beforeEach(() => {
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = true
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: createMatchMedia(),
    })
    jest.useFakeTimers()
    jest.setSystemTime(new Date(2026, 4, 19, 10, 0, 0))

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    mockedUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        username: 'testuser1',
        email: 'test@example.com',
        createdAt: '2026-05-01T00:00:00Z',
      },
    })

    mockedUsePageTitle.mockReturnValue({
      setTitle: jest.fn(),
      setBackLink: jest.fn(),
      setParentTitle: jest.fn(),
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })

    container.remove()
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  it('fetches last-week entries and renders personalized greeting', async () => {
    mockedGetDiaryEntries.mockResolvedValue({
      success: true,
      data: [createEntry('2026-05-19', 5)],
    })

    await renderWithProviders(<DashboardTemplate />)

    expect(mockedGetDiaryEntries).toHaveBeenCalledWith({
      fromDate: '2026-05-13',
      toDate: '2026-05-19',
    })

    expect(container.textContent).toContain('Good morning, Testuser1')
  })

  it('renders weekly insights metrics from recent entries', async () => {
    mockedGetDiaryEntries.mockResolvedValue({
      success: true,
      data: [
        createEntry('2026-05-13', 9),
        createEntry('2026-05-14', 8),
        createEntry('2026-05-15', 8),
        createEntry('2026-05-16', 4),
        createEntry('2026-05-17', 3),
        createEntry('2026-05-18', 2),
        createEntry('2026-05-19', 2),
      ],
    })

    await renderWithProviders(<DashboardTemplate />)

    expect(container.textContent).toContain('Weekly insights')
    expect(container.textContent).toContain('Current streak')
    expect(container.textContent).toContain('7 days')
    expect(container.textContent).toContain('Weekly trend')
    expect(container.textContent).toContain('improving')
  })

  it('switches entry action to new entry when selecting a day without entry', async () => {
    mockedGetDiaryEntries.mockResolvedValue({
      success: true,
      data: [
        createEntry('2026-05-13', 5),
        createEntry('2026-05-14', 4),
        createEntry('2026-05-15', 4),
        createEntry('2026-05-16', 4),
        createEntry('2026-05-17', 3),
        createEntry('2026-05-19', 3),
      ],
    })

    await renderWithProviders(<DashboardTemplate />)

    expect(container.textContent).toContain('Edit entry')

    const mondayNoEntryCard = Array.from(
      container.querySelectorAll('button')
    ).find(button => {
      const text = (button.textContent ?? '').toLowerCase()
      return (
        text.includes('mon') && text.includes('18') && text.includes('no entry')
      )
    })

    expect(mondayNoEntryCard).toBeTruthy()

    await act(async () => {
      mondayNoEntryCard?.dispatchEvent(
        new MouseEvent('click', { bubbles: true })
      )
    })

    expect(container.textContent).toContain('No entry yet for this day.')
    expect(container.textContent).toContain('New entry')
  })
})
