import { getHealth } from '../health'

import { insecureFetch } from '@/lib/backend-client'

jest.mock('@/lib/backend-client', () => ({
  insecureFetch: jest.fn(),
}))

const mockedInsecureFetch = jest.mocked(insecureFetch)

describe('getHealth', () => {
  beforeEach(() => {
    mockedInsecureFetch.mockReset()
  })

  it('returns the backend health response details', async () => {
    mockedInsecureFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ status: 'UP' }),
    } as unknown as Response)

    await expect(getHealth()).resolves.toEqual({
      ok: true,
      status: 200,
      body: { status: 'UP' },
    })
    expect(mockedInsecureFetch).toHaveBeenCalledWith('/actuator/health')
  })

  it('normalizes thrown errors', async () => {
    mockedInsecureFetch.mockRejectedValue(new Error('Backend unavailable'))

    await expect(getHealth()).resolves.toEqual({
      error: 'Backend unavailable',
    })
  })

  it('uses the fallback connection error for non-error rejections', async () => {
    mockedInsecureFetch.mockRejectedValue('offline')

    await expect(getHealth()).resolves.toEqual({
      error: 'Connection failed',
    })
  })
})
