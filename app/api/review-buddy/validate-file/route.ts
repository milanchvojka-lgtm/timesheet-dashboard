import { NextRequest, NextResponse } from 'next/server'
import { requireTeamMember } from '@/lib/auth-utils'
import { parseAndMapFile } from '@/lib/upload/parser'
import { createServerAdminClient } from '@/lib/supabase/server'
import { categorizeTimesheet } from '@/lib/calculations/activity-pairing'
import { mapProjectCategory } from '@/config/projects'

/**
 * API Route: POST /api/review-buddy/validate-file
 *
 * Validates a timesheet file without saving to database
 * Returns quality metrics and unpaired items for pre-upload review
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await requireTeamMember()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Team member access required.' },
        { status: 401 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only CSV and Excel files are supported.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    console.log(
      `[API] Validating ${file.name} (${(file.size / 1024).toFixed(2)} KB) from ${session.user.email}`
    )

    // Parse file (but don't save to database)
    const { data: parsedEntries, errors, totalRows } = await parseAndMapFile(file)

    // Check for parsing errors
    if (errors.length > 0) {
      const errorCount = errors.length
      const maxErrorsToShow = 10

      return NextResponse.json(
        {
          error: 'File validation failed',
          message: `Found ${errorCount} validation error(s) in ${totalRows} rows`,
          validation_errors: errors.slice(0, maxErrorsToShow),
          total_errors: errorCount,
          successful_rows: parsedEntries.length,
        },
        { status: 400 }
      )
    }

    // Check if file has data
    if (parsedEntries.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid data found',
          message: 'The file is empty or contains no valid timesheet entries',
        },
        { status: 400 }
      )
    }

    console.log(`[API] Parsed ${parsedEntries.length} valid rows from ${totalRows} total rows`)

    // Fetch activity keywords from database
    const supabase = createServerAdminClient()
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

    // Map project categories for all entries
    const entriesWithCategory = parsedEntries.map(entry => ({
      ...entry,
      project_category: mapProjectCategory(entry.project_name)
    }))


    // Categorize ALL entries to catch mistakes (not just OPS/Guiding)
    // This will detect when someone uses OPS-specific keywords on wrong projects
    // Use strict validation mode to flag OPS entries without keywords
    const categorized = categorizeTimesheet(
      entriesWithCategory.map(e => ({
        id: 0, // Not saved to database yet
        activity_name: e.activity_name,
        description: e.description || '',
        project_name: e.project_name,
        hours: Number(e.hours),
        date: e.date,
      })),
      keywords || [],
      true // Strict validation mode
    )

    console.log(`[API] Categorized ${categorized.length} entries, checking for validation issues...`)

    // Filter out 'Other' category entries (non-OPS/Guiding without validation issues)
    // Only count OPS and Guiding entries for quality metrics
    const relevantEntries = categorized.filter(e => e.category !== 'Other')

    // Calculate quality metrics
    const totalEntries = relevantEntries.length
    const pairedEntries = relevantEntries.filter(e => e.category !== 'Unpaired').length
    const unpairedEntries = relevantEntries.filter(e => e.category === 'Unpaired').length

    const totalHours = relevantEntries.reduce((sum, e) => sum + e.hours, 0)
    const unpairedHours = relevantEntries
      .filter(e => e.category === 'Unpaired')
      .reduce((sum, e) => sum + e.hours, 0)

    const qualityScore = totalEntries > 0
      ? (pairedEntries / totalEntries) * 100
      : 100

    // Get unpaired items with details
    // Create a combined array with categorization and original data for ALL entries
    const categorizedWithPerson = categorized.map((entry, index) => ({
      ...entry,
      person_name: entriesWithCategory[index].person_name,
    }))

    // Filter to only relevant entries (OPS/Guiding + mistakes on other projects)
    const relevantWithPerson = categorizedWithPerson.filter(e => e.category !== 'Other')

    const unpairedItems = relevantWithPerson
      .filter(e => e.category === 'Unpaired')
      .map((e, index) => ({
        id: `temp-${index}`, // Temporary ID for rendering
        date: e.date,
        person_name: e.person_name,
        project_name: e.project_name,
        activity_name: e.activity_name,
        hours: e.hours,
        description: e.description || '',
      }))

    // Group by person for summary (only relevant entries)
    const peopleMap = new Map<string, {
      totalEntries: number
      pairedEntries: number
      unpairedEntries: number
      totalHours: number
      unpairedHours: number
    }>()

    relevantWithPerson.forEach((entry) => {
      const person = peopleMap.get(entry.person_name) || {
        totalEntries: 0,
        pairedEntries: 0,
        unpairedEntries: 0,
        totalHours: 0,
        unpairedHours: 0,
      }

      person.totalEntries++
      person.totalHours += Number(entry.hours)

      if (entry.category === 'Unpaired') {
        person.unpairedEntries++
        person.unpairedHours += Number(entry.hours)
      } else {
        person.pairedEntries++
      }

      peopleMap.set(entry.person_name, person)
    })

    // Convert to array and calculate quality scores
    const people = Array.from(peopleMap.entries()).map(([person_name, data]) => {
      const personQualityScore = data.totalEntries > 0
        ? (data.pairedEntries / data.totalEntries) * 100
        : 100

      return {
        person_name,
        totalEntries: data.totalEntries,
        pairedEntries: data.pairedEntries,
        unpairedEntries: data.unpairedEntries,
        qualityScore: Number(personQualityScore.toFixed(2)),
        totalHours: Number(data.totalHours.toFixed(2)),
        unpairedHours: Number(data.unpairedHours.toFixed(2)),
      }
    })

    // Sort by quality score (lowest first - people who need most help)
    people.sort((a, b) => a.qualityScore - b.qualityScore)

    console.log(`[API] Validation complete: ${pairedEntries}/${totalEntries} paired (${qualityScore.toFixed(1)}%)`)

    return NextResponse.json({
      success: true,
      filename: file.name,
      fileSize: file.size,
      totalRows,
      totalEntries,
      pairedEntries,
      unpairedEntries,
      qualityScore: Number(qualityScore.toFixed(2)),
      totalHours: Number(totalHours.toFixed(2)),
      unpairedHours: Number(unpairedHours.toFixed(2)),
      unpairedItems,
      people,
    })
  } catch (error) {
    console.error('[API] Validation error:', error)

    return NextResponse.json(
      {
        error: 'Validation failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
