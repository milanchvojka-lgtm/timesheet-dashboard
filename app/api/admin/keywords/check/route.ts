import { NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerAdminClient()

    const { data: keywords, error } = await supabase
      .from('activity_keywords')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })

    if (error) {
      console.error('Error fetching keywords:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!keywords || keywords.length === 0) {
      return NextResponse.json({
        count: 0,
        keywords: [],
        message: 'NO KEYWORDS FOUND - This is why everything is unpaired!',
      })
    }

    const grouped = keywords.reduce((acc, kw) => {
      if (!acc[kw.category]) acc[kw.category] = []
      acc[kw.category].push(kw.keyword)
      return acc
    }, {} as Record<string, string[]>)

    return NextResponse.json({
      count: keywords.length,
      grouped,
      keywords,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
