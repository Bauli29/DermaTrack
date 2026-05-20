import {
  buildStatisticsApiPath,
  fetchCorrelationChart,
  fetchPsycheSymptomsChart,
  fetchSymptomsChart,
} from '../index'

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
    json: jest.fn().mockImplementation(() => Promise.resolve(jsonBody)),
    text: jest.fn().mockResolvedValue(textBody),
  }) as unknown as Response

const sampleLineChart = {
  chartType: 'line' as const,
  categories: [
    '2026-04-23',
    '2026-04-24',
    '2026-04-25',
    '2026-04-26',
    '2026-04-27',
    '2026-04-28',
    '2026-04-29',
  ],
  series: [
    {
      name: 'Mental Strain',
      data: [1, 2, 3, 4, 5, 6, 7],
    },
  ],
  dateRange: {
    from: '2026-04-23',
    to: '2026-04-29',
  },
}

const sampleColumnChart = {
  chartType: 'column' as const,
  categories: sampleLineChart.categories,
  series: [
    {
      name: 'Itchiness',
      data: [0, 1, 2, 3, 4, 5, 6],
    },
  ],
  dateRange: sampleLineChart.dateRange,
}

const sampleSparseLineChart = {
  chartType: 'line' as const,
  categories: sampleLineChart.categories,
  series: [
    {
      name: 'Mental Strain',
      data: [1, null, 3, null, 5, null, 7],
    },
  ],
  dateRange: sampleLineChart.dateRange,
}

const sampleCorrelationChart = {
  chartType: 'column' as const,
  categories: ['Skin Care', 'Hair Products', 'Soap Shampoo', 'Cosmetics'],
  series: [
    {
      name: 'Correlation',
      data: [0.812, 0.645, -0.201, 0.133],
    },
  ],
  dateRange: sampleLineChart.dateRange,
}

describe('statistics service', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('builds api paths with startDate and endDate', () => {
    expect(buildStatisticsApiPath('/api/statistics/symptoms')).toBe(
      '/api/statistics/symptoms'
    )
    expect(
      buildStatisticsApiPath('/api/statistics/symptoms', {
        endDate: '2026-04-29',
      })
    ).toBe('/api/statistics/symptoms?endDate=2026-04-29')
    expect(
      buildStatisticsApiPath('/api/statistics/symptoms', {
        startDate: '2026-03-31',
        endDate: '2026-04-29',
      })
    ).toBe('/api/statistics/symptoms?startDate=2026-03-31&endDate=2026-04-29')
    expect(
      buildStatisticsApiPath('/api/statistics/correlation', {
        startDate: '2026-03-31',
        endDate: '2026-04-29',
        mainCategory: 'care-products',
      })
    ).toBe(
      '/api/statistics/correlation?startDate=2026-03-31&endDate=2026-04-29&mainCategory=care-products'
    )
  })

  it('loads the psyche and symptoms chart from the frontend api route', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 200,
        contentType: 'application/json',
        jsonBody: sampleLineChart,
      })
    )

    await expect(
      fetchPsycheSymptomsChart(
        {
          startDate: '2026-03-31',
          endDate: '2026-04-29',
        },
        fetchImpl
      )
    ).resolves.toEqual({
      success: true,
      data: sampleLineChart,
    })

    expect(fetchImpl).toHaveBeenCalledWith(
      '/api/statistics/psyche-symptoms?startDate=2026-03-31&endDate=2026-04-29',
      {
        method: 'GET',
        cache: 'no-store',
      }
    )
  })

  it('loads the symptom chart and validates the response shape', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 200,
        contentType: 'application/json',
        jsonBody: sampleColumnChart,
      })
    )

    await expect(fetchSymptomsChart(undefined, fetchImpl)).resolves.toEqual({
      success: true,
      data: sampleColumnChart,
    })
    expect(fetchImpl).toHaveBeenCalledWith('/api/statistics/symptoms', {
      method: 'GET',
      cache: 'no-store',
    })
  })

  it('accepts sparse statistics responses with null gaps', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 200,
        contentType: 'application/json',
        jsonBody: sampleSparseLineChart,
      })
    )

    await expect(
      fetchPsycheSymptomsChart(undefined, fetchImpl)
    ).resolves.toEqual({
      success: true,
      data: sampleSparseLineChart,
    })
  })

  it('loads correlation chart with mainCategory and accepts non-date categories', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 200,
        contentType: 'application/json',
        jsonBody: sampleCorrelationChart,
      })
    )

    await expect(
      fetchCorrelationChart(
        {
          startDate: '2026-03-31',
          endDate: '2026-04-29',
          mainCategory: 'care-products',
        },
        fetchImpl
      )
    ).resolves.toEqual({
      success: true,
      data: sampleCorrelationChart,
    })

    expect(fetchImpl).toHaveBeenCalledWith(
      '/api/statistics/correlation?startDate=2026-03-31&endDate=2026-04-29&mainCategory=care-products',
      {
        method: 'GET',
        cache: 'no-store',
      }
    )
  })

  it('returns parsed api error messages for failing statistics requests', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 400,
        contentType: 'application/json',
        jsonBody: { error: 'Validation failed' },
      })
    )

    await expect(
      fetchSymptomsChart({ endDate: 'bad-date' }, fetchImpl)
    ).resolves.toEqual({
      success: false,
      error: 'Validation failed',
      status: 400,
    })
  })

  it('returns a contract error when the backend response is malformed', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      createMockResponse({
        status: 200,
        contentType: 'application/json',
        jsonBody: {
          chartType: 'line',
          categories: ['2026-04-29'],
        },
      })
    )

    await expect(
      fetchPsycheSymptomsChart(undefined, fetchImpl)
    ).resolves.toEqual({
      success: false,
      error: 'Invalid statistics response received.',
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
          status: 200,
          contentType: 'application/json',
          jsonBody: sampleLineChart,
        })
      )

    await expect(
      fetchPsycheSymptomsChart(undefined, fetchImpl)
    ).resolves.toEqual({
      success: true,
      data: sampleLineChart,
    })

    expect(fetchImpl).toHaveBeenCalledTimes(3)
    expect(fetchImpl).toHaveBeenNthCalledWith(2, '/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
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

    await expect(fetchSymptomsChart(undefined, textFetch)).resolves.toEqual({
      success: false,
      error: 'Backend unavailable',
      status: 503,
    })
    await expect(fetchSymptomsChart(undefined, failingFetch)).resolves.toEqual({
      success: false,
      error: 'Network down',
    })
  })
})
