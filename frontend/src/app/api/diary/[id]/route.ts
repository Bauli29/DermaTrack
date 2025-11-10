import { NextRequest, NextResponse } from 'next/server'

import { secureFetch } from '@/lib/backend-client'
import {
  isValidationError,
  validateRequestOrThrow,
} from '@/lib/validation-helper'

import { IDiaryEntry } from '@/types/diary'

import { DiaryEntrySchema } from '@/validation/diary'

/**
 * GET /api/diary/[id] - Fetch a single diary entry by ID
 * @param request - The incoming Next.js request object
 * @param params - Route parameters containing the diary entry ID
 * @returns NextResponse with the diary entry data or error message
 */
export const GET = async function (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const response = await secureFetch(`/api/diary/${id}`, {
      method: 'GET',
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        errorData ?? { error: 'Failed to fetch diary entry' },
        { status: response.status }
      )
    }

    const data: IDiaryEntry = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error while fetching diary entry' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/diary/[id] - Delete a diary entry by ID
 * @param request - The incoming Next.js request object
 * @param params - Route parameters containing the diary entry ID
 * @returns NextResponse with empty body and backend status code
 */
export const DELETE = async function (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const response = await secureFetch(`/api/diary/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        errorData ?? { error: 'Failed to delete diary entry' },
        { status: response.status }
      )
    }

    return new NextResponse(null, { status: response.status })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error while deleting diary entry' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/diary/[id] - Update a diary entry by ID
 * @param request - The incoming Next.js request object containing the updated diary entry data
 * @param params - Route parameters containing the diary entry ID
 * @returns NextResponse with the updated diary entry data or validation/error message
 */
export const PUT = async function (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate and throw if invalid
    const validatedData = validateRequestOrThrow(DiaryEntrySchema, body)

    const response = await secureFetch(`/api/diary/${id}`, {
      method: 'PUT',
      body: JSON.stringify(validatedData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        errorData ?? { error: 'Failed to edit diary entry' },
        { status: response.status }
      )
    }

    const data: IDiaryEntry = await response.json()

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    // Handle validation errors
    if (isValidationError(error)) {
      return NextResponse.json(error.validationError, { status: 400 })
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error while updating diary entry' },
      { status: 500 }
    )
  }
}
