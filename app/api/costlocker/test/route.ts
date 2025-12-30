import { NextResponse } from 'next/server'
import { requireTeamMember } from '@/lib/auth-utils'
import {
  testCostlockerConnection,
  CostlockerAPIError,
} from '@/lib/costlocker/api'

/**
 * API Route: GET /api/costlocker/test
 *
 * Test Costlocker API connection
 * Requires team member access (admin only)
 */

/**
 * GET /api/costlocker/test
 *
 * Tests the Costlocker API connection and credentials
 *
 * Returns:
 * - 200: Connection successful
 * - 401: Unauthorized (not logged in or not a team member)
 * - 500: Connection failed
 */
export async function GET() {
  try {
    // 1. Check authentication and team member status
    const session = await requireTeamMember()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Team member access required.' },
        { status: 401 }
      )
    }

    console.log(
      `[API] Testing Costlocker connection for ${session.user.email}`
    )

    // 2. Test connection
    await testCostlockerConnection()

    // 3. Return success
    return NextResponse.json({
      success: true,
      message: 'Costlocker API connection successful',
      apiUrl: process.env.COSTLOCKER_API_URL,
      hasToken: !!process.env.COSTLOCKER_API_TOKEN,
    })
  } catch (error) {
    console.error('[API] Costlocker connection test failed:', error)

    // Handle Costlocker API errors
    if (error instanceof CostlockerAPIError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Costlocker API connection failed',
          message: error.message,
          statusCode: error.statusCode,
          apiUrl: process.env.COSTLOCKER_API_URL,
          hasToken: !!process.env.COSTLOCKER_API_TOKEN,
        },
        { status: 500 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: 'Connection test failed',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        apiUrl: process.env.COSTLOCKER_API_URL,
        hasToken: !!process.env.COSTLOCKER_API_TOKEN,
      },
      { status: 500 }
    )
  }
}
