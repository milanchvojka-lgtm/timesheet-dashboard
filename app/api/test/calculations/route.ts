import { NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/server'
import { calculateWorkingDays } from '@/lib/calculations/working-days'
import { calculateTeamMonthlyFTE, calculateFTEStats } from '@/lib/calculations/fte'
import { categorizeTimesheet, getActivitySummary, calculateQualityScore } from '@/lib/calculations/activity-pairing'
import { calculateDashboardMetrics, calculateProjectMetrics } from '@/lib/calculations/metrics'

/**
 * API Route: GET /api/test/calculations
 *
 * Test business logic calculations with real data from database
 * For development and verification purposes
 */
export async function GET() {
  try {
    const supabase = createServerAdminClient()

    // Test 1: Working Days Calculation
    console.log('=== Test 1: Working Days Calculation ===')
    const workingDays = calculateWorkingDays(2025, 11) // November 2025
    console.log('November 2025:', workingDays)

    // Test 2: Fetch Real Data from Database
    console.log('\n=== Test 2: Fetch Real Data ===')
    const { data: entries, error: entriesError } = await supabase
      .from('timesheet_entries')
      .select('*')
      .limit(50)

    if (entriesError) {
      throw new Error(`Failed to fetch entries: ${entriesError.message}`)
    }

    console.log(`Fetched ${entries?.length || 0} entries`)

    if (!entries || entries.length === 0) {
      return NextResponse.json({
        message: 'No data in database yet. Upload some timesheet data first.',
        tests: {
          workingDays,
        },
      })
    }

    // Test 3: FTE Calculation
    console.log('\n=== Test 3: FTE Calculation ===')
    const fteData = calculateTeamMonthlyFTE(entries, 2025, 11)
    console.log('Team FTE for November 2025:', fteData)

    const fteStats = calculateFTEStats(fteData)
    console.log('FTE Stats:', fteStats)

    // Test 4: Dashboard Metrics
    console.log('\n=== Test 4: Dashboard Metrics ===')
    const dashboardMetrics = calculateDashboardMetrics(fteData)
    console.log('Dashboard Metrics:', dashboardMetrics)

    // Test 5: Project Metrics
    console.log('\n=== Test 5: Project Metrics ===')
    const projectMetrics = calculateProjectMetrics(entries, workingDays.workingHours)
    console.log('Project Metrics:', projectMetrics)

    // Test 6: Activity Categorization
    console.log('\n=== Test 6: Activity Categorization ===')

    // Fetch keywords
    const { data: keywords, error: keywordsError } = await supabase
      .from('activity_keywords')
      .select('*')

    if (keywordsError) {
      console.warn('No activity keywords found:', keywordsError.message)
    }

    const categorizedEntries = categorizeTimesheet(entries, keywords || [])
    const activitySummary = getActivitySummary(categorizedEntries)
    const qualityScore = calculateQualityScore(categorizedEntries)

    console.log('Activity Summary:', activitySummary)
    console.log('Quality Score:', qualityScore)

    // Return all results
    return NextResponse.json({
      success: true,
      message: 'All calculations completed successfully',
      tests: {
        workingDays,
        fteData: fteData.slice(0, 5), // First 5 people
        fteStats,
        dashboardMetrics,
        projectMetrics,
        activitySummary,
        qualityScore,
        totalEntriesProcessed: entries.length,
      },
    })
  } catch (error) {
    console.error('[API] Calculation test error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Calculation test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
