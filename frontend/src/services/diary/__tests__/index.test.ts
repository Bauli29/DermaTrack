//<reference types="jest" />

//import { expect, jest } from '@jest/globals'
import type { TDiaryEntryInput } from '@/validation/diary'
import { createDiaryEntry } from '../index'

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
})
