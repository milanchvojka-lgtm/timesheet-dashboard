import { NextRequest, NextResponse } from 'next/server'
import { requireTeamMember } from '@/lib/auth-utils'
import { createServerAdminClient } from '@/lib/supabase/server'

/**
 * API Route: GET /api/admin/fte/history?personName=...
 *
 * Fetches FTE history for a specific person
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
    const personName = searchParams.get('personName')

    if (!personName) {
      return NextResponse.json(
        { error: 'Person name is required' },
        { status: 400 }
      )
    }

    const supabase = createServerAdminClient()

    // Fetch all FTE records for this person (including historical)
    const { data: history, error } = await supabase
      .from('planned_fte')
      .select('*')
      .eq('person_name', personName)
      .order('valid_from', { ascending: false })

    if (error) {
      console.error('[API] Error fetching FTE history:', error)
      return NextResponse.json(
        { error: 'Failed to fetch FTE history' },
        { status: 500 }
      )
    }

    return NextResponse.json({ history: history || [] })
  } catch (error) {
    console.error('[API] FTE history fetch error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch FTE history',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
