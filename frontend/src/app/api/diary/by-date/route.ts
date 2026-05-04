import type { NextRequest } from 'next/server'

import {
  createDiaryServerErrorResponse,
  forwardDiaryResponse,
  proxyDiaryRequest,
} from '../_utils'

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    const response = await proxyDiaryRequest(request, {
      method: 'GET',
      searchParams: `?date=${date}`,
    })

    return forwardDiaryResponse(response, 'Failed to fetch diary entry by date')
  } catch {
    return createDiaryServerErrorResponse('fetching')
  }
}
