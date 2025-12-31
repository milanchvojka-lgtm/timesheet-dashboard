import { NextResponse } from 'next/server'
import { requireTeamMember } from '@/lib/auth-utils'
import { createServerAdminClient } from '@/lib/supabase/server'

/**
 * API Route: GET /api/team/members
 *
 * Returns list of all team members (distinct persons from timesheet_entries)
 */
export async function GET() {
  try {
    // Check authentication
    const session = await requireTeamMember()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Team member access required.' },
        { status: 401 }
      )
    }

    const supabase = createServerAdminClient()

    // Get distinct team members from timesheet_entries
    const { data: entries, error } = await supabase
      .from('timesheet_entries')
      .select('person_name, person_email')
      .order('person_name')

    if (error) {
      console.error('[API] Error fetching team members:', error)
      return NextResponse.json(
        { error: 'Failed to fetch team members' },
        { status: 500 }
      )
    }

    // Get unique team members
    const uniqueMembers = Array.from(
      new Map(
        entries?.map(e => [e.person_name, { person_name: e.person_name, person_email: e.person_email }])
      ).values()
    ).sort((a, b) => a.person_name.localeCompare(b.person_name))

    return NextResponse.json({
      members: uniqueMembers,
      count: uniqueMembers.length,
    })
  } catch (error) {
    console.error('[API] Team members error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
