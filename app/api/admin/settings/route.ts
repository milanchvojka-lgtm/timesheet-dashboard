import { NextRequest, NextResponse } from 'next/server'
import { requireTeamMember } from '@/lib/auth-utils'
import { createServerAdminClient } from '@/lib/supabase/server'

/**
 * API Route: GET /api/admin/settings
 *
 * Fetches all application settings
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

    // Fetch all settings
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .order('key')

    if (error) {
      console.error('[API] Error fetching settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      )
    }

    // Convert to key-value object
    const settingsMap = (settings || []).reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({ settings: settingsMap })
  } catch (error) {
    console.error('[API] Settings fetch error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch settings',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

/**
 * API Route: POST /api/admin/settings
 *
 * Updates application settings
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
    const { key, value } = body

    // Validate inputs
    if (!key) {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      )
    }

    // Determine value type based on key
    let valueType = 'string'
    let jsonValue = value

    // Validate and set type for specific settings
    if (key === 'default_period') {
      const validPeriods = ['monthly', 'quarterly', 'yearly']
      if (!validPeriods.includes(value)) {
        return NextResponse.json(
          { error: 'Invalid period value. Must be: monthly, quarterly, or yearly' },
          { status: 400 }
        )
      }
      valueType = 'string'
    }

    if (key === 'data_range_start' || key === 'data_range_end') {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(value)) {
        return NextResponse.json(
          { error: 'Invalid date format. Must be YYYY-MM-DD' },
          { status: 400 }
        )
      }

      // Validate date is valid
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date value' },
          { status: 400 }
        )
      }
      valueType = 'date'
    }

    const supabase = createServerAdminClient()

    // Check if setting exists
    const { data: existing, error: checkError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .maybeSingle()

    if (checkError) {
      console.error('[API] Error checking existing setting:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing setting' },
        { status: 500 }
      )
    }

    let updatedSetting

    if (existing) {
      // Update existing setting
      const { data, error: updateError } = await supabase
        .from('settings')
        .update({
          value: jsonValue,
          value_type: valueType,
          updated_at: new Date().toISOString(),
          updated_by: session.user.id
        })
        .eq('key', key)
        .select()
        .single()

      if (updateError) {
        console.error('[API] Error updating setting:', updateError)
        return NextResponse.json(
          { error: 'Failed to update setting' },
          { status: 500 }
        )
      }

      updatedSetting = data

      // Log to audit log
      await supabase.from('audit_log').insert({
        user_email: session.user.email,
        action: 'update_setting',
        entity_type: 'setting',
        entity_id: existing.id,
        details: {
          key,
          old_value: existing.value,
          new_value: jsonValue,
        },
      })
    } else {
      // Create new setting
      const { data, error: insertError } = await supabase
        .from('settings')
        .insert({
          key,
          value: jsonValue,
          value_type: valueType,
          is_public: false,
          updated_by: session.user.id
        })
        .select()
        .single()

      if (insertError) {
        console.error('[API] Error creating setting:', insertError)
        return NextResponse.json(
          { error: 'Failed to create setting' },
          { status: 500 }
        )
      }

      updatedSetting = data

      // Log to audit log
      await supabase.from('audit_log').insert({
        user_email: session.user.email,
        action: 'create_setting',
        entity_type: 'setting',
        entity_id: data.id,
        details: {
          key,
          value: jsonValue,
        },
      })
    }

    console.log(
      `[API] Setting ${existing ? 'updated' : 'created'}: ${key} = ${value} by ${session.user.email}`
    )

    return NextResponse.json({
      success: true,
      setting: updatedSetting,
    })
  } catch (error) {
    console.error('[API] Settings save error:', error)
    return NextResponse.json(
      {
        error: 'Failed to save setting',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
