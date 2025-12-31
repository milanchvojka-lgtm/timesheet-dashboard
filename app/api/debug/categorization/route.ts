import { NextRequest, NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/server'
import { categorizeTimesheet } from '@/lib/calculations/activity-pairing'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { error: 'Missing dateFrom or dateTo' },
        { status: 400 }
      )
    }

    const supabase = createServerAdminClient()

    // Fetch entries
    const { data: entries, error: entriesError } = await supabase
      .from('timesheet_entries')
      .select('*')
      .gte('date', dateFrom)
      .lte('date', dateTo)
      .order('date', { ascending: true })

    if (entriesError) {
      return NextResponse.json({ error: entriesError.message }, { status: 500 })
    }

    // Fetch keywords
    const { data: keywords, error: keywordsError } = await supabase
      .from('activity_keywords')
      .select('*')
      .eq('is_active', true)

    if (keywordsError) {
      return NextResponse.json({ error: keywordsError.message }, { status: 500 })
    }

    // Filter to OPS and Guiding projects only
    const opsEntries = entries?.filter((entry: any) => {
      const projectNameLower = entry.project_name?.toLowerCase() || ''
      return projectNameLower.includes('ops') || projectNameLower.includes('guiding')
    }) || []

    // Categorize
    const categorized = categorizeTimesheet(opsEntries, keywords || [])

    // Group by category
    const byCategory = {
      OPS_Hiring: categorized.filter(e => e.category === 'OPS_Hiring'),
      OPS_Jobs: categorized.filter(e => e.category === 'OPS_Jobs'),
      OPS_Reviews: categorized.filter(e => e.category === 'OPS_Reviews'),
      OPS_Guiding: categorized.filter(e => e.category === 'OPS_Guiding'),
      Unpaired: categorized.filter(e => e.category === 'Unpaired'),
    }

    // Calculate totals
    const totals = Object.entries(byCategory).map(([category, items]) => ({
      category,
      count: items.length,
      hours: items.reduce((sum, item) => sum + item.hours, 0).toFixed(2),
    }))

    return NextResponse.json({
      dateFrom,
      dateTo,
      totalOPSEntries: opsEntries.length,
      keywords: {
        OPS_Hiring: keywords?.filter(k => k.category === 'OPS_Hiring' || k.category === 'OPS Hiring').map(k => k.keyword),
        OPS_Jobs: keywords?.filter(k => k.category === 'OPS_Jobs' || k.category === 'OPS Jobs').map(k => k.keyword),
        OPS_Reviews: keywords?.filter(k => k.category === 'OPS_Reviews' || k.category === 'OPS Reviews').map(k => k.keyword),
        OPS_Guiding: keywords?.filter(k => k.category === 'OPS_Guiding' || k.category === 'OPS Guiding' || k.category === 'OPS General').map(k => k.keyword),
      },
      totals,
      byCategory: {
        OPS_Hiring: byCategory.OPS_Hiring.map(e => ({
          date: e.date,
          person: e.person_name,
          project: e.project_name,
          activity: e.activity_name,
          description: e.description,
          hours: e.hours,
        })),
        OPS_Jobs: byCategory.OPS_Jobs.map(e => ({
          date: e.date,
          person: e.person_name,
          project: e.project_name,
          activity: e.activity_name,
          description: e.description,
          hours: e.hours,
        })),
        OPS_Reviews: byCategory.OPS_Reviews.map(e => ({
          date: e.date,
          person: e.person_name,
          project: e.project_name,
          activity: e.activity_name,
          description: e.description,
          hours: e.hours,
        })),
        OPS_Guiding: byCategory.OPS_Guiding.slice(0, 10).map(e => ({ // Only first 10 to avoid huge response
          date: e.date,
          person: e.person_name,
          project: e.project_name,
          activity: e.activity_name,
          description: e.description,
          hours: e.hours,
        })),
        Unpaired: byCategory.Unpaired.map(e => ({
          date: e.date,
          person: e.person_name,
          project: e.project_name,
          activity: e.activity_name,
          description: e.description,
          hours: e.hours,
        })),
      },
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
