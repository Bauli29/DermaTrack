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
    const backendSearchParams = new URLSearchParams()

    if (date) {
      backendSearchParams.set('date', date)
    }

    const response = await proxyDiaryRequest(request, {
      method: 'GET',
      id: 'by-date',
      searchParams: backendSearchParams.toString(),
    })

    return forwardDiaryResponse(response, 'Failed to fetch diary entry by date')
  } catch {
    return createDiaryServerErrorResponse('fetching')
  }
}
