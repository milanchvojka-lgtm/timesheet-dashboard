import { NextRequest, NextResponse } from 'next/server'
import { requireTeamMember } from '@/lib/auth-utils'
import { createServerAdminClient } from '@/lib/supabase/server'
import { calculateFTEStats } from '@/lib/calculations/fte'
import { getWorkingHoursForPeriod } from '@/lib/calculations/working-days'

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
 * API Route: GET /api/analytics/overview
 *
 * Returns dashboard overview metrics and FTE trends
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

    // Fetch timesheet entries in batches (Supabase has 1000-row limit)
    let allEntries: TimesheetEntry[] = []
    let from = 0
    const batchSize = 1000
    let hasMore = true

    while (hasMore) {
      const { data: batch, error } = await supabase
        .from('timesheet_entries')
        .select('*')
        .gte('date', dateFrom)
        .lte('date', dateTo)
        .order('date', { ascending: true })
        .range(from, from + batchSize - 1)

      if (error) {
        console.error('[API] Error fetching timesheet entries:', error)
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

    if (!entries || entries.length === 0) {
      return NextResponse.json({
        metrics: {
          totalEntries: 0,
          totalHours: 0,
          totalFTE: 0,
          averageFTE: 0,
          highestFTE: 0,
          lowestFTE: 0,
          peopleCount: 0,
        },
        trends: [],
      })
    }

    // Calculate working hours for the period
    const workingHours = getWorkingHoursForPeriod(dateFrom, dateTo)

    // Group by person and calculate FTE
    const personMap = new Map<string, { name: string; hours: number }>()

    entries.forEach((entry) => {
      const existing = personMap.get(entry.person_name) || { name: entry.person_name, hours: 0 }
      existing.hours += Number(entry.hours)
      personMap.set(entry.person_name, existing)
    })

    // Calculate FTE for each person
    const personFTEs = Array.from(personMap.values()).map((person) => ({
      person_name: person.name,
      fte: Number((person.hours / workingHours).toFixed(2)),
      hours: person.hours,
    }))

    // Calculate stats
    const stats = calculateFTEStats(personFTEs)

    // Group by month for trends
    const monthlyData = new Map<string, Map<string, number>>()

    entries.forEach((entry) => {
      const month = entry.date.substring(0, 7) // YYYY-MM
      if (!monthlyData.has(month)) {
        monthlyData.set(month, new Map())
      }

      const monthMap = monthlyData.get(month)!
      const currentHours = monthMap.get(entry.person_name) || 0
      monthMap.set(entry.person_name, currentHours + Number(entry.hours))
    })

    // Calculate monthly FTE trends
    const trends = Array.from(monthlyData.entries())
      .map(([month, personHours]) => {
        const [year, monthNum] = month.split('-').map(Number)
        const monthWorkingHours = getWorkingHoursForPeriod(
          `${month}-01`,
          `${month}-${new Date(year, monthNum, 0).getDate()}`
        )

        const totalHours = Array.from(personHours.values()).reduce((sum, h) => sum + h, 0)
        const peopleCount = personHours.size

        return {
          month,
          totalFTE: Number((totalHours / monthWorkingHours).toFixed(2)),
          averageFTE: Number((totalHours / monthWorkingHours / peopleCount).toFixed(2)),
          totalHours,
          peopleCount,
        }
      })
      .sort((a, b) => a.month.localeCompare(b.month))

    // Return metrics and trends
    return NextResponse.json({
      metrics: {
        totalEntries: entries.length,
        totalHours: entries.reduce((sum, e) => sum + Number(e.hours), 0),
        totalFTE: Number((entries.reduce((sum, e) => sum + Number(e.hours), 0) / workingHours).toFixed(2)),
        averageFTE: stats.averageFTE,
        highestFTE: stats.highestFTE,
        lowestFTE: stats.lowestFTE,
        peopleCount: personFTEs.length,
      },
      trends,
      period: {
        dateFrom,
        dateTo,
        workingHours,
      },
    })
  } catch (error) {
    console.error('[API] Overview error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
