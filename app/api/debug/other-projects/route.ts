import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/server'
import { mapProjectCategory } from '@/config/projects'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom') || '2025-11-01'
    const dateTo = searchParams.get('dateTo') || '2025-11-30'

    const supabase = createServerAdminClient()

    // Get all entries for the date range
    const { data: entries, error } = await supabase
      .from('timesheet_entries')
      .select('project_name, hours, person_name, date, description')
      .gte('date', dateFrom)
      .lte('date', dateTo)
      .order('project_name')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter entries that map to "Other"
    const otherEntries = entries?.filter(entry =>
      mapProjectCategory(entry.project_name) === 'Other'
    ) || []

    // Group by project name
    const projectSummary = new Map<string, { hours: number; entries: number; people: Set<string> }>()

    otherEntries.forEach(entry => {
      const existing = projectSummary.get(entry.project_name)
      if (existing) {
        existing.hours += entry.hours
        existing.entries++
        existing.people.add(entry.person_name)
      } else {
        projectSummary.set(entry.project_name, {
          hours: entry.hours,
          entries: 1,
          people: new Set([entry.person_name])
        })
      }
    })

    // Convert to array
    const summary = Array.from(projectSummary.entries()).map(([project, data]) => ({
      project,
      hours: parseFloat(data.hours.toFixed(2)),
      entries: data.entries,
      people: Array.from(data.people),
      peopleCount: data.people.size,
    }))

    // Sort by hours descending
    summary.sort((a, b) => b.hours - a.hours)

    return NextResponse.json({
      dateRange: { from: dateFrom, to: dateTo },
      totalOtherHours: parseFloat(otherEntries.reduce((sum, e) => sum + e.hours, 0).toFixed(2)),
      totalOtherEntries: otherEntries.length,
      projectCount: summary.length,
      projects: summary,
      sampleEntries: otherEntries.slice(0, 10).map(e => ({
        date: e.date,
        person: e.person_name,
        project: e.project_name,
        hours: e.hours,
        description: e.description,
      })),
    })
  } catch (error) {
    console.error('Other projects debug error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
