import { NextRequest, NextResponse } from 'next/server'
import { requireTeamMember } from '@/lib/auth-utils'
import { createServerAdminClient } from '@/lib/supabase/server'
import { getWorkingHoursForPeriod } from '@/lib/calculations/working-days'

/**
 * API Route: GET /api/analytics/projects
 *
 * Returns project distribution and trends
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

    // Fetch timesheet entries
    const supabase = createServerAdminClient()
    const { data: entries, error } = await supabase
      .from('timesheet_entries')
      .select('*')
      .gte('date', dateFrom)
      .lte('date', dateTo)
      .order('date', { ascending: true })

    if (error) {
      console.error('[API] Error fetching timesheet entries:', error)
      return NextResponse.json(
        { error: 'Failed to fetch timesheet data' },
        { status: 500 }
      )
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json({
        summary: [],
        trends: [],
      })
    }

    // Calculate working hours for the period
    const workingHours = getWorkingHoursForPeriod(dateFrom, dateTo)

    // Group by project category
    const projectMap = new Map<string, { hours: number; entryCount: number }>()

    entries.forEach((entry) => {
      const category = entry.project_category
      const existing = projectMap.get(category) || { hours: 0, entryCount: 0 }
      existing.hours += Number(entry.hours)
      existing.entryCount += 1
      projectMap.set(category, existing)
    })

    // Calculate total hours
    const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0)

    // Create project summary
    const summary = Array.from(projectMap.entries())
      .map(([category, data]) => ({
        category,
        hours: Number(data.hours.toFixed(2)),
        entryCount: data.entryCount,
        fte: Number((data.hours / workingHours).toFixed(2)),
        percentage: Number(((data.hours / totalHours) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.hours - a.hours)

    // Group by month and category for trends
    const monthlyData = new Map<string, Map<string, number>>()

    entries.forEach((entry) => {
      const month = entry.date.substring(0, 7) // YYYY-MM
      if (!monthlyData.has(month)) {
        monthlyData.set(month, new Map())
      }

      const monthMap = monthlyData.get(month)!
      const category = entry.project_category
      const currentHours = monthMap.get(category) || 0
      monthMap.set(category, currentHours + Number(entry.hours))
    })

    // Get all unique categories
    const allCategories = new Set(summary.map(s => s.category))

    // Calculate monthly trends
    const trends = Array.from(monthlyData.entries())
      .map(([month, categoryHours]) => {
        const [year, monthNum] = month.split('-').map(Number)
        const monthWorkingHours = getWorkingHoursForPeriod(
          `${month}-01`,
          `${month}-${new Date(year, monthNum, 0).getDate()}`
        )

        const result: Record<string, number | string> = { month }

        // Add each category's FTE
        allCategories.forEach(category => {
          const hours = categoryHours.get(category) || 0
          result[category] = Number((hours / monthWorkingHours).toFixed(2))
        })

        return result
      })
      .sort((a, b) => String(a.month).localeCompare(String(b.month)))

    // Return projects data
    return NextResponse.json({
      summary,
      trends,
      period: {
        dateFrom,
        dateTo,
        workingHours,
        totalHours,
      },
    })
  } catch (error) {
    console.error('[API] Projects error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
