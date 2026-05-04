import type { NextRequest } from 'next/server'

import {
  createStatisticsRequestErrorResponse,
  forwardStatisticsResponse,
  proxyStatisticsRequest,
} from '../_utils'

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const response = await proxyStatisticsRequest(request, 'psyche-symptoms')
    return forwardStatisticsResponse(
      response,
      'Failed to fetch psyche and symptoms statistics'
    )
  } catch (error) {
    return createStatisticsRequestErrorResponse(error)
  }
}
