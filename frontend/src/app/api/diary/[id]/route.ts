import type { NextRequest } from 'next/server'

import {
  createDiaryMutationErrorResponse,
  createDiaryServerErrorResponse,
  forwardDiaryResponse,
  IDiaryRouteContext,
  proxyDiaryRequest,
  readDiaryRouteId,
  readValidatedDiaryBody,
} from '../_utils'

/**
 * GET /api/diary/[id] - Fetch a single diary entry by ID
 * @param request - The incoming Next.js request object
 * @param context - Route context containing the diary entry ID parameter
 * @returns Response with the diary entry data or error message
 */
export const GET = async function (
  request: NextRequest,
  context: IDiaryRouteContext
) {
  try {
    const id = await readDiaryRouteId(context)
    const response = await proxyDiaryRequest(request, {
      method: 'GET',
      id,
    })
    return forwardDiaryResponse(response, 'Failed to fetch diary entry')
  } catch {
    return createDiaryServerErrorResponse('fetching')
  }
}

/**
 * DELETE /api/diary/[id] - Delete a diary entry by ID
 * @param request - The incoming Next.js request object
 * @param context - Route context containing the diary entry ID parameter
 * @returns Response with empty body and backend status code
 */
export const DELETE = async function (
  request: NextRequest,
  context: IDiaryRouteContext
) {
  try {
    const id = await readDiaryRouteId(context)
    const response = await proxyDiaryRequest(request, {
      method: 'DELETE',
      id,
    })
    return forwardDiaryResponse(response, 'Failed to delete diary entry')
  } catch {
    return createDiaryServerErrorResponse('deleting')
  }
}

/**
 * PUT /api/diary/[id] - Update a diary entry by ID
 * @param request - The incoming Next.js request object containing the updated diary entry data
 * @param context - Route context containing the diary entry ID parameter
 * @returns Response with the updated diary entry data or validation/error message
 */
export const PUT = async function (
  request: NextRequest,
  context: IDiaryRouteContext
) {
  try {
    const id = await readDiaryRouteId(context)
    const validatedData = await readValidatedDiaryBody(request)
    const response = await proxyDiaryRequest(request, {
      method: 'PUT',
      id,
      body: JSON.stringify(validatedData),
    })
    return forwardDiaryResponse(response, 'Failed to edit diary entry')
  } catch (error) {
    return createDiaryMutationErrorResponse(error, 'updating')
  }
}
