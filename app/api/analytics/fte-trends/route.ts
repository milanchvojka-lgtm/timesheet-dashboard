import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/server'
import { calculateWorkingDays } from '@/lib/calculations/working-days'

/**
 * API Route: GET /api/analytics/fte-trends
 *
 * Returns FTE metrics and monthly breakdown for the selected period
 *
 * Query params:
 * - dateFrom: Start date (YYYY-MM-DD)
 * - dateTo: End date (YYYY-MM-DD)
 *
 * Returns:
 * - metrics: Overall metrics (totalFTE, averageFTE, teamSize, totalHours)
 * - trends: Monthly breakdown array
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { error: 'Missing dateFrom or dateTo parameters' },
        { status: 400 }
      )
    }

    const supabase = createServerAdminClient()

    // Fetch timesheet entries for period
    const { data: entries, error } = await supabase
      .from('timesheet_entries')
      .select('*')
      .gte('date', dateFrom)
      .lte('date', dateTo)
      .order('date', { ascending: true })

    if (error) {
      console.error('[FTE Trends API] Database error:', error)
      throw error
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json({
        metrics: {
          plannedFTE: 0,
          totalFTE: 0,
          averageFTE: 0,
          teamSize: 0,
          totalHours: 0,
        },
        trends: [],
      })
    }

    // Calculate overall metrics
    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0)
    const uniquePeople = new Set(
      entries.map((e) => e.person_email || e.person_name)
    ).size

    // Get unique person names who actually tracked time
    const activeTrackers = Array.from(new Set(entries.map((e) => e.person_name)))

    // Fetch planned FTE for people who tracked time, filtered by date range
    // Query: valid_from <= dateTo AND (valid_to IS NULL OR valid_to >= dateFrom)
    const { data: plannedFTEs, error: fteError } = await supabase
      .from('planned_fte')
      .select('*')
      .in('person_name', activeTrackers)
      .lte('valid_from', dateTo)
      .or(`valid_to.is.null,valid_to.gte.${dateFrom}`)

    if (fteError) {
      console.error('[FTE Trends API] Planned FTE error:', fteError)
    }

    // For each person, find the FTE record valid at the end of the period (dateTo)
    // If multiple records exist, pick the one with latest valid_from <= dateTo
    const personFTEMap = new Map<string, number>()

    activeTrackers.forEach((personName) => {
      const personRecords = plannedFTEs?.filter((p) => p.person_name === personName) || []

      if (personRecords.length > 0) {
        // Sort by valid_from descending and pick the first one (latest record)
        const validRecord = personRecords
          .filter((r) => r.valid_from <= dateTo)
          .sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0]

        if (validRecord) {
          personFTEMap.set(personName, validRecord.fte_value)
        }
      }
    })

    // Calculate total planned FTE (sum of FTE for people who tracked time)
    const plannedFTE = Array.from(personFTEMap.values()).reduce((sum, fte) => sum + fte, 0)

    // Group entries by month
    const monthlyGroups: Record<
      string,
      Array<(typeof entries)[0]>
    > = {}

    entries.forEach((entry) => {
      const monthKey = entry.date.substring(0, 7) // YYYY-MM
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = []
      }
      monthlyGroups[monthKey].push(entry)
    })

    // Calculate monthly FTE trends
    const trends = Object.keys(monthlyGroups)
      .sort()
      .map((monthKey) => {
        const monthEntries = monthlyGroups[monthKey]
        const monthHours = monthEntries.reduce((sum, e) => sum + e.hours, 0)
        const monthPeople = new Set(
          monthEntries.map((e) => e.person_email || e.person_name)
        ).size

        // Parse month for working hours calculation
        const [year, month] = monthKey.split('-').map(Number)
        const workingDaysResult = calculateWorkingDays(year, month)
        const totalWorkingHours = workingDaysResult.workingHours

        // Calculate FTE for this month
        const totalFTE =
          totalWorkingHours > 0 ? monthHours / totalWorkingHours : 0
        const averageFTE = monthPeople > 0 ? totalFTE / monthPeople : 0

        // Format month label
        const monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ]
        const monthLabel = `${monthNames[month - 1]} ${year}`

        return {
          month: monthLabel,
          totalFTE: parseFloat(totalFTE.toFixed(2)),
          averageFTE: parseFloat(averageFTE.toFixed(2)),
          teamSize: monthPeople,
        }
      })

    // Calculate overall average FTE across all months
    const totalFTE = trends.reduce((sum, t) => sum + t.totalFTE, 0)
    const averageFTE = trends.length > 0 ? totalFTE / trends.length : 0

    return NextResponse.json({
      metrics: {
        plannedFTE: parseFloat(plannedFTE.toFixed(2)),
        totalFTE: parseFloat(totalFTE.toFixed(1)),
        averageFTE: parseFloat(averageFTE.toFixed(2)),
        teamSize: uniquePeople,
        totalHours,
      },
      trends,
    })
  } catch (error) {
    console.error('[FTE Trends API] Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch FTE trends',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
