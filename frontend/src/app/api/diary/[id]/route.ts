import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

import { IDiaryEntry } from '@/types/diary'

import { DiaryEntrySchema } from '@/validation/diary'

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:8080'

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
    const response = await fetch(`${BACKEND_API_URL}/api/diary/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        errorData ?? { error: 'Failed to fetch diary entry' },
        { status: response.status }
      )
    }

    const data: IDiaryEntry = await response.json()

    return NextResponse.json(data, {
      status: 200,
    })
  } catch {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
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
    const response = await fetch(`${BACKEND_API_URL}/api/diary/${id}`, {
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
    //Zod Validation
    const diaryEntry = DiaryEntrySchema.parse(body)

    const response = await fetch(`${BACKEND_API_URL}/api/diary/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(diaryEntry),
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
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map(
            issue => `${issue.path.join('.')}: ${issue.message}`
          ),
        },
        { status: 400 }
      )
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}
