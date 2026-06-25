// app/api/tracking-guide/lookup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { createServerAdminClient } from '@/lib/supabase/server'
import { categorizeActivity, ActivityKeyword } from '@/lib/calculations/activity-pairing'
import {
  normalizeText,
  matchesQuery,
  buildRecommendation,
  type LookupCandidate,
} from '@/lib/tracking-guide/lookup'

interface EntryRow {
  project_name: string
  project_category: string
  activity_name: string
  description: string | null
  hours: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerAdminClient()
    const rawQuery = request.nextUrl.searchParams.get('q') ?? ''
    const normalizedQuery = normalizeText(rawQuery)

    // ---- Browse mode: most common activities ----
    if (normalizedQuery.length < 2) {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .select('activity_name, project_category, hours')
        .limit(10000)
      if (error) throw error

      const agg = new Map<
        string,
        { activityName: string; hoursByCategory: Map<string, number>; totalHours: number; entryCount: number }
      >()
      for (const row of (data ?? []) as Pick<EntryRow, 'activity_name' | 'project_category' | 'hours'>[]) {
        const key = row.activity_name
        const item = agg.get(key) ?? { activityName: key, hoursByCategory: new Map(), totalHours: 0, entryCount: 0 }
        item.totalHours += row.hours
        item.entryCount += 1
        item.hoursByCategory.set(
          row.project_category,
          (item.hoursByCategory.get(row.project_category) ?? 0) + row.hours
        )
        agg.set(key, item)
      }

      const common = Array.from(agg.values())
        .filter((item) => {
          const name = item.activityName.trim().toLowerCase()
          // Determine the dominant category for this item (needed for generic check)
          let topCat = ''
          let topH = -1
          item.hoursByCategory.forEach((h, cat) => { if (h > topH) { topH = h; topCat = cat } })
          return name !== 'internal' && name !== topCat.trim().toLowerCase()
        })
        .sort((a, b) => b.totalHours - a.totalHours)
        .slice(0, 20)
        .map((item) => {
          let topCategory: string | null = null
          let topHours = -1
          Array.from(item.hoursByCategory.entries()).forEach(([cat, hours]) => {
            if (hours > topHours) {
              topHours = hours
              topCategory = cat
            }
          })
          return {
            activityName: item.activityName,
            projectCategory: topCategory,
            totalHours: Math.round(item.totalHours * 10) / 10,
            entryCount: item.entryCount,
          }
        })

      return NextResponse.json({ common })
    }

    // ---- Search mode ----
    const { data: keywordsData, error: kwError } = await supabase
      .from('activity_keywords')
      .select('id, category, keyword')
      .eq('is_active', true)
    if (kwError) throw kwError
    const keywords = (keywordsData ?? []) as ActivityKeyword[]

    // Broad pre-filter on the first token, then refine with normalized matching in JS.
    const firstToken = normalizedQuery.split(' ')[0].replace(/[,()%]/g, '')
    // If sanitization resulted in empty token, return empty results for consistency.
    if (!firstToken) {
      return NextResponse.json(buildRecommendation([]))
    }
    const { data: entries, error: entriesError } = await supabase
      .from('timesheet_entries')
      .select('project_name, project_category, activity_name, description, hours')
      .or(`activity_name.ilike.%${firstToken}%,description.ilike.%${firstToken}%`)
      .limit(5000)
    if (entriesError) throw entriesError

    const candidates: LookupCandidate[] = []
    for (const row of (entries ?? []) as EntryRow[]) {
      if (!matchesQuery(row.activity_name, row.description, normalizedQuery)) continue
      const category = categorizeActivity(
        row.activity_name,
        row.description,
        row.project_name,
        keywords,
        true // strict — flags mistakes as 'Unpaired'
      )
      candidates.push({
        projectName: row.project_name,
        projectCategory: row.project_category,
        activityName: row.activity_name,
        description: row.description,
        hours: row.hours,
        isUnpaired: category === 'Unpaired',
      })
    }

    return NextResponse.json(buildRecommendation(candidates))
  } catch (error) {
    console.error('[API] tracking-guide lookup error:', error)
    return NextResponse.json(
      { error: 'Lookup failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
