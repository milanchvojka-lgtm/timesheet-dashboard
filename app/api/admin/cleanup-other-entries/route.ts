import { NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/server'
import { requireTeamMember } from '@/lib/auth-utils'

export async function POST() {
  try {
    const session = await requireTeamMember()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Team member access required.' }, { status: 401 })
    }

    const supabase = createServerAdminClient()

    // First count how many will be deleted
    const { count, error: countError } = await supabase
      .from('timesheet_entries')
      .select('*', { count: 'exact', head: true })
      .eq('project_category', 'Other')
      .gte('date', '2026-02-01')
      .lte('date', '2026-02-28')

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    // Delete all 'Other' category entries in February 2026
    const { error: deleteError } = await supabase
      .from('timesheet_entries')
      .delete()
      .eq('project_category', 'Other')
      .gte('date', '2026-02-01')
      .lte('date', '2026-02-28')

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Other category entries deleted successfully',
      entriesDeleted: count ?? 0,
      dateRange: '2026-02-01 to 2026-02-28',
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
