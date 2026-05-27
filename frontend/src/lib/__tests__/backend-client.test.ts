import {
  getBackendUrl,
  getPublicHeaders,
  getSecureHeaders,
  insecureFetch,
  secureFetch,
} from '../backend-client'

describe('backend client', () => {
  const originalFetch = globalThis.fetch

  const response = { ok: true } as Response

  afterEach(() => {
    globalThis.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('builds backend URLs and default headers', () => {
    expect(getBackendUrl('/api/health')).toBe(
      'http://localhost:8080/api/health'
    )
    expect(getSecureHeaders()).toEqual({ 'Content-Type': 'application/json' })
    expect(getSecureHeaders(false)).toEqual({})
    expect(getPublicHeaders()).toEqual({ 'Content-Type': 'application/json' })
    expect(getPublicHeaders(false)).toEqual({})
  })

  it('merges default and caller headers for secure backend requests', async () => {
    const fetchMock = jest.fn().mockResolvedValue(response)
    globalThis.fetch = fetchMock

    await expect(
      secureFetch('/api/protected', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer token',
          'Content-Type': 'application/custom+json',
        },
      })
    ).resolves.toBe(response)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/protected',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/custom+json',
          Authorization: 'Bearer token',
        },
      }
    )
  })

  it('merges default and caller headers for public backend requests', async () => {
    const fetchMock = jest.fn().mockResolvedValue(response)
    globalThis.fetch = fetchMock

    await expect(
      insecureFetch('/api/public', {
        headers: {
          Accept: 'application/json',
        },
      })
    ).resolves.toBe(response)

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/public', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
  })
})
