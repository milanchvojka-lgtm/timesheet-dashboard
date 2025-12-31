import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom') || '2025-11-01'
    const dateTo = searchParams.get('dateTo') || '2025-11-30'

    const supabase = createServerAdminClient()

    // Get all entries
    const { data: entries, error } = await supabase
      .from('timesheet_entries')
      .select('*')
      .gte('date', dateFrom)
      .lte('date', dateTo)
      .order('date', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter to OPS and Guiding projects
    const opsEntries = entries?.filter((entry: any) => {
      const projectNameLower = entry.project_name?.toLowerCase() || ''
      return projectNameLower.includes('ops') || projectNameLower.includes('guiding')
    }) || []

    // Find all with review-related keywords
    const reviewKeywords = ['review', 'feedback', '1:1', 'one-on-one', 'evaluation']

    const possibleReviews = opsEntries.filter((entry: any) => {
      const searchText = `${entry.activity_name} ${entry.description || ''}`.toLowerCase()
      return reviewKeywords.some(keyword => searchText.includes(keyword.toLowerCase()))
    })

    const totalHours = possibleReviews.reduce((sum: number, e: any) => sum + Number(e.hours), 0)

    return NextResponse.json({
      dateFrom,
      dateTo,
      totalOPSEntries: opsEntries.length,
      possibleReviewsCount: possibleReviews.length,
      possibleReviewsHours: totalHours.toFixed(2),
      entries: possibleReviews.map((e: any) => ({
        date: e.date,
        person: e.person_name,
        project: e.project_name,
        activity: e.activity_name,
        description: e.description,
        hours: e.hours,
      })),
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
