import { NextRequest, NextResponse } from 'next/server'
import { requireTeamMember } from '@/lib/auth-utils'
import { getUploadHistory } from '@/lib/upload/importer'

/**
 * API Route: GET /api/upload/history
 *
 * Get upload history for team members
 * Returns list of recent uploads with statistics
 */

/**
 * GET /api/upload/history
 *
 * Query Parameters:
 * - limit (optional): Number of records to return (default: 20)
 *
 * Returns:
 * - 200: Upload history array
 * - 401: Unauthorized
 * - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and team member status
    const session = await requireTeamMember()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Team member access required.' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    // Fetch upload history
    const history = await getUploadHistory(limit)

    return NextResponse.json({
      success: true,
      history,
      count: history.length,
    })
  } catch (error) {
    console.error('[API] Upload history error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch upload history',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
