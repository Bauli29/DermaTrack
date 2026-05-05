import type { NextRequest } from 'next/server'

import {
  createDiaryMutationErrorResponse,
  createDiaryServerErrorResponse,
  forwardDiaryResponse,
  proxyDiaryRequest,
  readValidatedDiaryBody,
} from './_utils'

/**
 * GET /api/diary - Fetch all diary entries
 * @returns Response with array of diary entries or error message
 */
export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const searchParams = request.nextUrl.searchParams.toString()
    const response = await proxyDiaryRequest(request, {
      method: 'GET',
      cache: 'no-store',
      searchParams,
    })
    return forwardDiaryResponse(response, 'Failed to fetch diary entries')
  } catch {
    return createDiaryServerErrorResponse('fetching')
  }
}

/**
 * POST /api/diary - Create a new diary entry
 * @param request - The incoming Next.js request object containing diary entry data
 * @returns Response with the created diary entry or validation/error message
 */
export const POST = async (request: NextRequest): Promise<Response> => {
  try {
    const validatedData = await readValidatedDiaryBody(request)
    const response = await proxyDiaryRequest(request, {
      method: 'POST',
      body: JSON.stringify(validatedData),
    })
    return forwardDiaryResponse(response, 'Failed to create diary entry')
  } catch (error) {
    return createDiaryMutationErrorResponse(error, 'creating')
  }
}
