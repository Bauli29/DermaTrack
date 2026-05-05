//<reference types="jest" />

//import { expect, jest } from '@jest/globals'
import type { TDiaryEntryInput } from '@/validation/diary'
import { createDiaryEntry, fetchDiaryEntries } from '../index'

const createMockResponse = ({
  status,
  contentType,
  jsonBody,
  textBody = '',
}: {
  status: number
  contentType?: string
  jsonBody?: unknown
  textBody?: string
}): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) =>
        name === 'content-type' ? (contentType ?? null) : null,
    },
    json: jest.fn().mockImplementation(() => {
      if (jsonBody instanceof Error) {
        return Promise.reject(jsonBody)
      }

      return Promise.resolve(jsonBody)
    }),
    text: jest.fn().mockResolvedValue(textBody),
  }) as unknown as Response

describe('diary service', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('submits diary entries to the frontend api route', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 201,
        contentType: 'application/json',
        jsonBody: { id: 'entry-1' },
      })
    )

    const payload: TDiaryEntryInput = {
      entryDate: '2026-04-27',
      tracking: {
        psyche: { stressLevel: 3 },
        contactFactors: {},
        nutrition: {},
        careProducts: {},
        health: {},
        symptoms: { itchiness: 5 },
      },
    }

    await expect(createDiaryEntry(payload, fetchImpl)).resolves.toEqual({
      success: true,
    })
    expect(fetchImpl).toHaveBeenCalledWith('/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  })

  it('loads diary entries from the frontend api route', async () => {
    const entries = [
      {
        id: 'entry-1',
        userId: 'user-1',
        createdAt: '2026-04-27T10:00:00Z',
        entryDate: '2026-04-27',
        tracking: {
          psyche: { stressLevel: 3 },
          contactFactors: {},
          nutrition: {},
          careProducts: {},
          health: {},
          symptoms: { itchiness: 5 },
        },
        notes: null,
      },
    ]
    const fetchImpl = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 200,
        contentType: 'application/json',
        jsonBody: entries,
      })
    )

    await expect(fetchDiaryEntries(fetchImpl)).resolves.toEqual({
      success: true,
      data: entries,
    })
    expect(fetchImpl).toHaveBeenCalledWith('/api/diary', {
      method: 'GET',
      cache: 'no-store',
    })
  })

  it('returns a contract error for malformed diary entry lists', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 200,
        contentType: 'application/json',
        jsonBody: [{ id: 'entry-1' }],
      })
    )

    await expect(fetchDiaryEntries(fetchImpl)).resolves.toEqual({
      success: false,
      error: 'Invalid diary response received.',
    })
  })

  it('uses PUT when updating an existing diary entry', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 200,
        contentType: 'application/json',
        jsonBody: { id: 'entry-3' },
      })
    )

    const payload = {
      id: 'entry-3',
      entryDate: '2026-04-27',
      tracking: {
        psyche: { stressLevel: 2 },
        contactFactors: {},
        nutrition: {},
        careProducts: {},
        health: {},
        symptoms: { itchiness: 6 },
      },
    }

    await expect(createDiaryEntry(payload, fetchImpl)).resolves.toEqual({
      success: true,
    })
    expect(fetchImpl).toHaveBeenCalledWith('/api/diary/entry-3', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  })

  it('returns parsed api error messages for failing diary submissions', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 400,
        contentType: 'application/json',
        jsonBody: { error: 'Validation failed' },
      })
    )

    await expect(
      createDiaryEntry(
        {
          entryDate: '2026-04-27',
          tracking: {
            psyche: {},
            contactFactors: {},
            nutrition: {},
            careProducts: {},
            health: {},
            symptoms: { itchiness: 5 },
          },
        },
        fetchImpl
      )
    ).resolves.toEqual({
      success: false,
      error: 'Validation failed',
    })
  })

  it('falls back to text and thrown runtime messages when needed', async () => {
    const textFetch = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 503,
        contentType: 'text/plain',
        textBody: 'Backend unavailable',
      })
    )
    const failingFetch = jest.fn().mockRejectedValue(new Error('Network down'))

    const samplePayload: TDiaryEntryInput = {
      entryDate: '2026-04-27',
      tracking: {
        psyche: {},
        contactFactors: {},
        nutrition: {},
        careProducts: {},
        health: {},
        symptoms: { itchiness: 5 },
      },
    }

    await expect(createDiaryEntry(samplePayload, textFetch)).resolves.toEqual({
      success: false,
      error: 'Backend unavailable',
    })

    await expect(
      createDiaryEntry(samplePayload, failingFetch)
    ).resolves.toEqual({
      success: false,
      error: 'Network down',
    })
  })

  it('silently refreshes the session and retries once on 401', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(
        createMockResponse({
          status: 401,
          contentType: 'application/json',
          jsonBody: { error: 'Unauthorized' },
        })
      )
      .mockResolvedValueOnce(
        createMockResponse({
          status: 200,
          contentType: 'application/json',
          jsonBody: { refreshed: true },
        })
      )
      .mockResolvedValueOnce(
        createMockResponse({
          status: 201,
          contentType: 'application/json',
          jsonBody: { id: 'entry-2' },
        })
      )

    await expect(
      createDiaryEntry(
        {
          symptoms: 4,
          stressLevel: 2,
        },
        fetchImpl
      )
    ).resolves.toEqual({ success: true })

    expect(fetchImpl).toHaveBeenCalledTimes(3)
    expect(fetchImpl).toHaveBeenNthCalledWith(2, '/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
  })

  it('returns 401 error when refresh token is also invalid', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(
        createMockResponse({
          status: 401,
          contentType: 'application/json',
          jsonBody: { error: 'Session expired' },
        })
      )
      .mockResolvedValueOnce(
        createMockResponse({
          status: 401,
          contentType: 'application/json',
          jsonBody: { error: 'Refresh token invalid' },
        })
      )

    await expect(
      createDiaryEntry(
        {
          symptoms: 4,
        },
        fetchImpl
      )
    ).resolves.toEqual({
      success: false,
      error: 'Session expired',
    })

    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('retries at most once even if the retried request is still unauthorized', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(
        createMockResponse({
          status: 401,
          contentType: 'application/json',
          jsonBody: { error: 'Unauthorized' },
        })
      )
      .mockResolvedValueOnce(
        createMockResponse({
          status: 200,
          contentType: 'application/json',
          jsonBody: { refreshed: true },
        })
      )
      .mockResolvedValueOnce(
        createMockResponse({
          status: 401,
          contentType: 'application/json',
          jsonBody: { error: 'Still unauthorized' },
        })
      )

    await expect(
      createDiaryEntry(
        {
          symptoms: 4,
        },
        fetchImpl
      )
    ).resolves.toEqual({
      success: false,
      error: 'Still unauthorized',
    })

    expect(fetchImpl).toHaveBeenCalledTimes(3)
  })
})
