import { NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createServerAdminClient()

    // Update all entries with project_name "Guiding_2025" to have project_category "Guiding"
    const { data: updated, error } = await supabase
      .from('timesheet_entries')
      .update({ project_category: 'Guiding' })
      .eq('project_name', 'Guiding_2025')
      .select()

    if (error) {
      console.error('Error updating Guiding category:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also update any other Guiding variants that might be "Other"
    const guidingVariants = [
      'Guiding_2024',
      'Guiding_2026',
      'Guiding',
    ]

    let totalUpdated = updated?.length || 0

    for (const variant of guidingVariants) {
      const { data, error: variantError } = await supabase
        .from('timesheet_entries')
        .update({ project_category: 'Guiding' })
        .eq('project_name', variant)
        .select()

      if (!variantError && data) {
        totalUpdated += data.length
      }
    }

    return NextResponse.json({
      message: 'Guiding category fixed successfully',
      updatedCount: totalUpdated,
      updatedEntries: updated?.length || 0,
    })
  } catch (error) {
    console.error('Fix Guiding category error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
