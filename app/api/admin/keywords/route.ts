import { NextRequest, NextResponse } from 'next/server'
import { requireTeamMember } from '@/lib/auth-utils'
import { createServerAdminClient } from '@/lib/supabase/server'

/**
 * API Route: GET /api/admin/keywords
 *
 * Fetches all activity keywords (both active and inactive)
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

    // Fetch all keywords
    const { data: keywords, error } = await supabase
      .from('activity_keywords')
      .select('*')
      .order('category')
      .order('keyword')

    if (error) {
      console.error('[API] Error fetching keywords:', error)
      return NextResponse.json(
        { error: 'Failed to fetch keywords' },
        { status: 500 }
      )
    }

    return NextResponse.json({ keywords: keywords || [] })
  } catch (error) {
    console.error('[API] Keywords fetch error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch keywords',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

/**
 * API Route: POST /api/admin/keywords
 *
 * Creates a new activity keyword
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
    const { keyword, category, description } = body

    // Validate inputs
    if (!keyword || !keyword.trim()) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      )
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['OPS_Hiring', 'OPS_Jobs', 'OPS_Reviews', 'OPS_Guiding']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    const supabase = createServerAdminClient()

    // Check if keyword already exists (case-insensitive)
    const { data: existing, error: checkError } = await supabase
      .from('activity_keywords')
      .select('id, keyword, category')
      .ilike('keyword', keyword.trim())
      .maybeSingle()

    if (checkError) {
      console.error('[API] Error checking existing keyword:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing keyword' },
        { status: 500 }
      )
    }

    if (existing) {
      return NextResponse.json(
        { error: `Keyword "${existing.keyword}" already exists in category ${existing.category}` },
        { status: 400 }
      )
    }

    // Insert new keyword
    const { data: newKeyword, error: insertError } = await supabase
      .from('activity_keywords')
      .insert({
        keyword: keyword.trim().toLowerCase(),
        category,
        description: description?.trim() || null,
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[API] Error creating keyword:', insertError)
      return NextResponse.json(
        { error: 'Failed to create keyword' },
        { status: 500 }
      )
    }

    // Log to audit log
    await supabase.from('audit_log').insert({
      user_email: session.user.email,
      action: 'create_keyword',
      entity_type: 'activity_keyword',
      entity_id: newKeyword.id,
      details: {
        keyword: newKeyword.keyword,
        category: newKeyword.category,
        description: newKeyword.description,
      },
    })

    console.log(
      `[API] Keyword created: "${newKeyword.keyword}" (${newKeyword.category}) by ${session.user.email}`
    )

    return NextResponse.json({
      success: true,
      keyword: newKeyword,
    })
  } catch (error) {
    console.error('[API] Create keyword error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create keyword',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

/**
 * API Route: PATCH /api/admin/keywords
 *
 * Updates an existing keyword (toggle active status or update details)
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

    // Parse request body
    const body = await request.json()
    const { keywordId, isActive, description } = body

    if (!keywordId) {
      return NextResponse.json(
        { error: 'Keyword ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerAdminClient()

    // Get existing keyword
    const { data: existing, error: fetchError } = await supabase
      .from('activity_keywords')
      .select('*')
      .eq('id', keywordId)
      .maybeSingle()

    if (fetchError) {
      console.error('[API] Error fetching keyword:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch keyword' },
        { status: 500 }
      )
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'Keyword not found' },
        { status: 404 }
      )
    }

    // Build update object
    const updates: any = {}
    if (isActive !== undefined) {
      updates.is_active = isActive
    }
    if (description !== undefined) {
      updates.description = description?.trim() || null
    }

    // Update keyword
    const { data: updated, error: updateError } = await supabase
      .from('activity_keywords')
      .update(updates)
      .eq('id', keywordId)
      .select()
      .single()

    if (updateError) {
      console.error('[API] Error updating keyword:', updateError)
      return NextResponse.json(
        { error: 'Failed to update keyword' },
        { status: 500 }
      )
    }

    // Log to audit log
    const { error: auditError } = await supabase.from('audit_log').insert({
      user_email: session.user.email,
      action: 'update_keyword',
      entity_type: 'activity_keyword',
      entity_id: keywordId,
      details: {
        keyword: existing.keyword,
        old_is_active: existing.is_active,
        new_is_active: updated.is_active,
        old_description: existing.description,
        new_description: updated.description,
      },
    })

    if (auditError) {
      console.error('[API] AUDIT LOG INSERT FAILED:', auditError)
    } else {
      console.log('[API] Audit log entry created successfully')
    }

    console.log(
      `[API] Keyword updated: "${updated.keyword}" by ${session.user.email}`
    )

    return NextResponse.json({
      success: true,
      keyword: updated,
    })
  } catch (error) {
    console.error('[API] Update keyword error:', error)
    return NextResponse.json(
      {
        error: 'Failed to update keyword',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

/**
 * API Route: DELETE /api/admin/keywords
 *
 * Deletes a keyword (soft delete by setting is_active to false)
 */
export async function DELETE(request: NextRequest) {
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
    const { keywordId } = body

    if (!keywordId) {
      return NextResponse.json(
        { error: 'Keyword ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerAdminClient()

    // Get keyword details before deletion
    const { data: keyword, error: fetchError } = await supabase
      .from('activity_keywords')
      .select('*')
      .eq('id', keywordId)
      .maybeSingle()

    if (fetchError) {
      console.error('[API] Error fetching keyword:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch keyword' },
        { status: 500 }
      )
    }

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword not found' },
        { status: 404 }
      )
    }

    // Soft delete - set is_active to false
    const { error: deleteError } = await supabase
      .from('activity_keywords')
      .update({ is_active: false })
      .eq('id', keywordId)

    if (deleteError) {
      console.error('[API] Error deleting keyword:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete keyword' },
        { status: 500 }
      )
    }

    // Log to audit log
    await supabase.from('audit_log').insert({
      user_email: session.user.email,
      action: 'delete_keyword',
      entity_type: 'activity_keyword',
      entity_id: keywordId,
      details: {
        keyword: keyword.keyword,
        category: keyword.category,
      },
    })

    console.log(
      `[API] Keyword deleted: "${keyword.keyword}" by ${session.user.email}`
    )

    return NextResponse.json({
      success: true,
      message: 'Keyword deactivated successfully',
    })
  } catch (error) {
    console.error('[API] Delete keyword error:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete keyword',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
