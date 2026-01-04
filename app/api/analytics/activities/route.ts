import { NextRequest, NextResponse } from 'next/server'
import { requireTeamMember } from '@/lib/auth-utils'
import { createServerAdminClient } from '@/lib/supabase/server'
import { categorizeTimesheet, getActivitySummary, calculateQualityScore } from '@/lib/calculations/activity-pairing'

interface TimesheetEntry {
  id: string
  date: string
  person_name: string
  person_email: string | null
  project_name: string
  activity_name: string
  description: string | null
  hours: number
  is_billable: boolean | null
  project_category: string | null
  upload_id: string
  created_at: string
}

/**
 * API Route: GET /api/analytics/activities
 *
 * Returns activity categorization and quality metrics
 * Query params: dateFrom, dateTo (YYYY-MM-DD format)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await requireTeamMember()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Team member access required.' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { error: 'Missing required parameters: dateFrom, dateTo' },
        { status: 400 }
      )
    }

    const supabase = createServerAdminClient()

    // Fetch timesheet entries in batches (Supabase has 1000-row limit)
    let allEntries: TimesheetEntry[] = []
    let from = 0
    const batchSize = 1000
    let hasMore = true

    while (hasMore) {
      const { data: batch, error: entriesError } = await supabase
        .from('timesheet_entries')
        .select('*')
        .gte('date', dateFrom)
        .lte('date', dateTo)
        .order('date', { ascending: true })
        .range(from, from + batchSize - 1)

      if (entriesError) {
        console.error('[API] Error fetching timesheet entries:', entriesError)
        return NextResponse.json(
          { error: 'Failed to fetch timesheet data' },
          { status: 500 }
        )
      }

      if (batch && batch.length > 0) {
        allEntries = allEntries.concat(batch)
        hasMore = batch.length === batchSize
        from += batchSize
      } else {
        hasMore = false
      }
    }

    const entries = allEntries

    // Fetch activity keywords
    const { data: keywords, error: keywordsError } = await supabase
      .from('activity_keywords')
      .select('*')
      .eq('is_active', true)

    if (keywordsError) {
      console.error('[API] Error fetching keywords:', keywordsError)
      return NextResponse.json(
        { error: 'Failed to fetch activity keywords' },
        { status: 500 }
      )
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json({
        summary: [],
        qualityScore: 100,
        trends: [],
        totalEntries: 0,
      })
    }

    // Categorize activities
    const categorized = categorizeTimesheet(
      entries.map(e => ({
        id: e.id,
        activity_name: e.activity_name,
        description: e.description || '',
        project_name: e.project_name,
        hours: Number(e.hours),
        date: e.date,
      })),
      keywords || []
    )

    // Get activity summary
    const summary = getActivitySummary(categorized)

    // Calculate quality score
    const qualityScore = calculateQualityScore(categorized)

    // Group by month and category for trends
    const monthlyData = new Map<string, Map<string, number>>()

    categorized.forEach((entry) => {
      const month = entry.date.substring(0, 7) // YYYY-MM
      if (!monthlyData.has(month)) {
        monthlyData.set(month, new Map())
      }

      const monthMap = monthlyData.get(month)!
      const currentHours = monthMap.get(entry.category) || 0
      monthMap.set(entry.category, currentHours + entry.hours)
    })

    // Get all unique categories
    const allCategories = new Set(summary.map(s => s.category))

    // Calculate monthly trends
    const trends = Array.from(monthlyData.entries())
      .map(([month, categoryHours]) => {
        const result: Record<string, number | string> = { month }

        // Add each category's hours
        allCategories.forEach(category => {
          const hours = categoryHours.get(category) || 0
          result[category] = Number(hours.toFixed(2))
        })

        return result
      })
      .sort((a, b) => String(a.month).localeCompare(String(b.month)))

    // Return activities data
    return NextResponse.json({
      summary,
      qualityScore,
      trends,
      totalEntries: entries.length,
      entries: categorized, // Include categorized entries for unpaired items section
      period: {
        dateFrom,
        dateTo,
      },
    })
  } catch (error) {
    console.error('[API] Activities error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
