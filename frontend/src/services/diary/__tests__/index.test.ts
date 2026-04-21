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

    await expect(
      createDiaryEntry(
        {
          symptoms: 5,
          stressLevel: 3,
        },
        fetchImpl
      )
    ).resolves.toEqual({ success: true })

    expect(fetchImpl).toHaveBeenCalledWith('/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symptoms: 5,
        stressLevel: 3,
      }),
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
          symptoms: 5,
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

    await expect(
      createDiaryEntry(
        {
          symptoms: 5,
        },
        textFetch
      )
    ).resolves.toEqual({
      success: false,
      error: 'Backend unavailable',
    })

    await expect(
      createDiaryEntry(
        {
          symptoms: 5,
        },
        failingFetch
      )
    ).resolves.toEqual({
      success: false,
      error: 'Network down',
    })
  })
})
