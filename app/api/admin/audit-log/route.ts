import { NextRequest, NextResponse } from 'next/server'
import { requireTeamMember } from '@/lib/auth-utils'
import { createServerAdminClient } from '@/lib/supabase/server'

/**
 * API Route: GET /api/admin/audit-log
 *
 * Fetches audit log entries with optional filtering and pagination
 * Query params:
 * - user_email: Filter by user email
 * - action: Filter by action type
 * - date_from: Filter by date (from)
 * - date_to: Filter by date (to)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50, max: 100)
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

    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const userEmail = searchParams.get('user_email')
    const action = searchParams.get('action')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)

    const offset = (page - 1) * limit

    const supabase = createServerAdminClient()

    // Build query
    let query = supabase
      .from('audit_log')
      .select('*', { count: 'exact' })

    // Apply filters
    if (userEmail) {
      query = query.eq('user_email', userEmail)
    }

    if (action) {
      query = query.eq('action', action)
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      // Add one day to include the entire end date
      const endDate = new Date(dateTo)
      endDate.setDate(endDate.getDate() + 1)
      query = query.lt('created_at', endDate.toISOString())
    }

    // Execute query with pagination
    const { data: logs, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[API] Error fetching audit log:', error)
      return NextResponse.json(
        { error: 'Failed to fetch audit log' },
        { status: 500 }
      )
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      logs: logs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('[API] Audit log fetch error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch audit log',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
