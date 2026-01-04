import { NextRequest, NextResponse } from 'next/server'
import { requireTeamMember } from '@/lib/auth-utils'
import { createServerAdminClient } from '@/lib/supabase/server'

/**
 * API Route: GET /api/admin/fte
 *
 * Fetches current planned FTE values for all team members
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await requireTeamMember()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Team member access required.' },
        { status: 401 }
      )
    }

    const supabase = createServerAdminClient()

    // Fetch ALL FTE records (including historical)
    const { data: allRecords, error } = await supabase
      .from('planned_fte')
      .select('*')
      .order('person_name')
      .order('valid_from', { ascending: false })

    if (error) {
      console.error('[API] Error fetching FTE records:', error)
      return NextResponse.json(
        { error: 'Failed to fetch FTE records' },
        { status: 500 }
      )
    }

    // Group by person and get the latest record for each
    const personMap = new Map<string, any>()

    allRecords?.forEach((record) => {
      if (!personMap.has(record.person_name)) {
        personMap.set(record.person_name, record)
      }
    })

    // Convert to array and mark status
    const fteRecords = Array.from(personMap.values()).map((record) => ({
      ...record,
      status: record.valid_to === null ? 'active' : 'historical'
    }))

    return NextResponse.json({ fteRecords: fteRecords || [] })
  } catch (error) {
    console.error('[API] FTE fetch error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch FTE records',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

/**
 * API Route: POST /api/admin/fte
 *
 * Creates or updates planned FTE value for a team member
 * Implements temporal versioning by setting valid_to on old records
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

    // Parse request body
    const body = await request.json()
    const { personName, fte, validFrom } = body

    // Validate inputs
    if (!personName) {
      return NextResponse.json(
        { error: 'Person name is required' },
        { status: 400 }
      )
    }

    if (fte === undefined || fte === null) {
      return NextResponse.json(
        { error: 'FTE value is required' },
        { status: 400 }
      )
    }

    // Validate FTE range (0-2, step 0.05)
    const fteNum = parseFloat(fte)
    if (isNaN(fteNum) || fteNum < 0 || fteNum > 2) {
      return NextResponse.json(
        { error: 'FTE must be between 0 and 2' },
        { status: 400 }
      )
    }

    // Validate FTE step (0.05)
    const remainder = (fteNum * 100) % 5
    if (remainder !== 0) {
      return NextResponse.json(
        { error: 'FTE must be in increments of 0.05 (e.g., 0.05, 0.10, 0.15, ...)' },
        { status: 400 }
      )
    }

    if (!validFrom) {
      return NextResponse.json(
        { error: 'Valid from date is required' },
        { status: 400 }
      )
    }

    const supabase = createServerAdminClient()
    const now = new Date().toISOString()
    const validFromDate = new Date(validFrom).toISOString().split('T')[0]

    // Check for existing current record (valid_to is null)
    const { data: existingRecord, error: checkError } = await supabase
      .from('planned_fte')
      .select('*')
      .eq('person_name', personName)
      .is('valid_to', null)
      .maybeSingle()

    if (checkError) {
      console.error('[API] Error checking existing FTE:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing FTE record' },
        { status: 500 }
      )
    }

    // If there's an existing record, close it by setting valid_to
    if (existingRecord) {
      // Set valid_to to the day before the new valid_from
      const validToDate = new Date(validFromDate)
      validToDate.setDate(validToDate.getDate() - 1)
      const validToString = validToDate.toISOString().split('T')[0]

      const { error: updateError } = await supabase
        .from('planned_fte')
        .update({ valid_to: validToString })
        .eq('id', existingRecord.id)

      if (updateError) {
        console.error('[API] Error closing old FTE record:', updateError)
        return NextResponse.json(
          { error: 'Failed to update existing FTE record' },
          { status: 500 }
        )
      }

      console.log(
        `[API] Closed FTE record for ${personName}: ${existingRecord.fte_value} (valid until ${validToString})`
      )
    }

    // Insert new FTE record
    const { data: newRecord, error: insertError } = await supabase
      .from('planned_fte')
      .insert({
        person_name: personName,
        fte_value: fteNum,
        valid_from: validFromDate,
        valid_to: null, // Current record
        user_id: null, // Optional - not all people are users in the system
      })
      .select()
      .single()

    if (insertError) {
      console.error('[API] Error creating FTE record:', insertError)
      return NextResponse.json(
        { error: 'Failed to create FTE record' },
        { status: 500 }
      )
    }

    // Log to audit log
    await supabase.from('audit_log').insert({
      user_email: session.user.email,
      action: existingRecord ? 'update_fte' : 'create_fte',
      entity_type: 'planned_fte',
      entity_id: newRecord.id,
      details: {
        person_name: personName,
        old_fte: existingRecord?.fte_value || null,
        new_fte: fteNum,
        valid_from: validFromDate,
      },
    })

    console.log(
      `[API] FTE ${existingRecord ? 'updated' : 'created'} for ${personName}: ${fteNum} (from ${validFromDate}) by ${session.user.email}`
    )

    return NextResponse.json({
      success: true,
      record: newRecord,
    })
  } catch (error) {
    console.error('[API] FTE save error:', error)
    return NextResponse.json(
      {
        error: 'Failed to save FTE record',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

/**
 * API Route: GET /api/admin/fte/history?personName=...
 *
 * Fetches FTE history for a specific person
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await requireTeamMember()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Team member access required.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const personName = searchParams.get('personName')

    if (!personName) {
      return NextResponse.json(
        { error: 'Person name is required' },
        { status: 400 }
      )
    }

    const supabase = createServerAdminClient()

    // Fetch all FTE records for this person (including historical)
    const { data: history, error } = await supabase
      .from('planned_fte')
      .select('*')
      .eq('person_name', personName)
      .order('valid_from', { ascending: false })

    if (error) {
      console.error('[API] Error fetching FTE history:', error)
      return NextResponse.json(
        { error: 'Failed to fetch FTE history' },
        { status: 500 }
      )
    }

    return NextResponse.json({ history: history || [] })
  } catch (error) {
    console.error('[API] FTE history fetch error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch FTE history',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
