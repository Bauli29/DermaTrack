import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { IDiaryEntry } from '@/types/diary'

import { DiaryEntrySchema } from '@/validation/diary'

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:8080'

/**
 * GET /api/diary - Fetch all diary entries
 * @returns NextResponse with array of diary entries or error message
 */
export const GET = async (): Promise<NextResponse> => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/diary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        errorData ?? { error: 'Failed to fetch diary entries' },
        { status: response.status }
      )
    }

    const data: IDiaryEntry[] = await response.json()

    return NextResponse.json(data, { status: 200 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error while fetching diary entries' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/diary - Create a new diary entry
 * @param request - The incoming Next.js request object containing diary entry data
 * @returns NextResponse with the created diary entry or validation/error message
 */
export const POST = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json()

    const diaryEntry = DiaryEntrySchema.parse(body)

    const response = await fetch(`${BACKEND_API_URL}/api/diary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(diaryEntry),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        errorData ?? { error: 'Failed to create diary entry' },
        { status: response.status }
      )
    }

    const createdEntry: IDiaryEntry = await response.json()

    return NextResponse.json(createdEntry, { status: 201 })
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

    return NextResponse.json(
      { error: 'Internal server error while creating diary entry' },
      { status: 500 }
    )
  }
}
