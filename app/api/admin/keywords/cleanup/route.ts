import { NextResponse } from 'next/server'
import { createServerAdminClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createServerAdminClient()

    // Delete the extra keywords that shouldn't be in OPS_Reviews
    const keywordsToRemove = [
      'performance review',
      'evaluation',
      'feedback',
      '1:1',
      'one-on-one'
    ]

    const { data: deleted, error } = await supabase
      .from('activity_keywords')
      .delete()
      .in('keyword', keywordsToRemove)
      .eq('category', 'OPS Reviews')
      .select()

    if (error) {
      console.error('Error deleting keywords:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get remaining keywords for OPS Reviews
    const { data: remaining, error: fetchError } = await supabase
      .from('activity_keywords')
      .select('*')
      .eq('category', 'OPS Reviews')
      .eq('is_active', true)

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Keywords cleaned up successfully',
      deleted: deleted?.length || 0,
      deletedKeywords: deleted?.map(k => k.keyword),
      remainingKeywords: remaining?.map(k => k.keyword),
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
