import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import {
  fetchTimesheetData,
  CostlockerAPIError,
} from '@/lib/costlocker/api'
import { transformTimesheetEntries } from '@/lib/costlocker/transformer'

/**
 * API Route: GET /api/costlocker/timesheet
 *
 * Fetch timesheet data from Costlocker API
 * Requires authentication
 * Validates query parameters and returns transformed data
 */

/**
 * Query parameter validation schema
 */
const QuerySchema = z.object({
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  personId: z.string().regex(/^\d+$/).transform(Number).optional(),
  projectId: z.string().regex(/^\d+$/).transform(Number).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).refine(val => val >= 1, 'Page must be >= 1').optional(),
  perPage: z.string().regex(/^\d+$/).transform(Number).refine(val => val >= 1 && val <= 100, 'PerPage must be between 1 and 100').optional(),
})

/**
 * GET /api/costlocker/timesheet
 *
 * Query Parameters:
 * - dateFrom (required): Start date in YYYY-MM-DD format
 * - dateTo (required): End date in YYYY-MM-DD format
 * - personId (optional): Filter by person ID
 * - projectId (optional): Filter by project ID
 * - page (optional): Page number for pagination (default: fetch all)
 * - perPage (optional): Items per page, max 100 (default: 100)
 *
 * Returns:
 * - 200: Array of transformed timesheet entries
 * - 400: Invalid query parameters
 * - 401: Unauthorized (not logged in)
 * - 500: Costlocker API error or server error
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // 2. Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const queryParams: Record<string, string> = {}

    // Only include parameters that are present
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const personId = searchParams.get('personId')
    const projectId = searchParams.get('projectId')
    const page = searchParams.get('page')
    const perPage = searchParams.get('perPage')

    if (dateFrom) queryParams.dateFrom = dateFrom
    if (dateTo) queryParams.dateTo = dateTo
    if (personId) queryParams.personId = personId
    if (projectId) queryParams.projectId = projectId
    if (page) queryParams.page = page
    if (perPage) queryParams.perPage = perPage

    const validationResult = QuerySchema.safeParse(queryParams)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: validationResult.error.format(),
        },
        { status: 400 }
      )
    }

    const params = validationResult.data

    // 3. Validate date range
    const startDate = new Date(params.dateFrom)
    const endDate = new Date(params.dateTo)

    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'dateFrom must be before or equal to dateTo' },
        { status: 400 }
      )
    }

    // Prevent fetching too large date ranges (max 1 year)
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysDiff > 365) {
      return NextResponse.json(
        { error: 'Date range cannot exceed 365 days' },
        { status: 400 }
      )
    }

    console.log(
      `[API] Fetching timesheet data for ${session.user.email}: ${params.dateFrom} to ${params.dateTo}`
    )

    // 4. Fetch data from Costlocker API
    const costlockerData = await fetchTimesheetData(params)

    // 5. Transform data to internal format
    const transformedData = transformTimesheetEntries(costlockerData)

    console.log(
      `[API] Returning ${transformedData.length} transformed entries`
    )

    // 6. Return transformed data
    return NextResponse.json({
      success: true,
      data: transformedData,
      meta: {
        count: transformedData.length,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
      },
    })
  } catch (error) {
    console.error('[API] Error fetching timesheet data:', error)

    // Handle Costlocker API errors
    if (error instanceof CostlockerAPIError) {
      return NextResponse.json(
        {
          error: 'Costlocker API error',
          message: error.message,
          statusCode: error.statusCode,
        },
        { status: error.statusCode || 500 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: 'Internal server error',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
