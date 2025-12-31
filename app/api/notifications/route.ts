import { NextRequest, NextResponse } from 'next/server'
import { requireTeamMember } from '@/lib/auth-utils'
import { getActiveNotifications } from '@/lib/notifications/notification-checker'

/**
 * API Route: GET /api/notifications
 *
 * Fetches active notifications for the dashboard
 * Query params:
 * - dateFrom: Start date (YYYY-MM-DD)
 * - dateTo: End date (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await requireTeamMember()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Team member access required.' },
        { status: 401 }
      )
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { error: 'Missing required parameters: dateFrom, dateTo' },
        { status: 400 }
      )
    }

    // Get active notifications
    const notifications = await getActiveNotifications(dateFrom, dateTo)

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('[API] Notifications fetch error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch notifications',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
