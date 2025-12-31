import { NextRequest, NextResponse } from 'next/server'
import { requireTeamMember } from '@/lib/auth-utils'
import { createServerAdminClient } from '@/lib/supabase/server'

/**
 * API Route: GET /api/admin/team-members
 *
 * Fetches all team members from the database
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

    // Fetch only active team members (is_team_member = true)
    const supabase = createServerAdminClient()
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('is_team_member', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API] Error fetching team members:', error)
      return NextResponse.json(
        { error: 'Failed to fetch team members' },
        { status: 500 }
      )
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error('[API] Team members fetch error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch team members',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

/**
 * API Route: POST /api/admin/team-members
 *
 * Adds a new team member to the database
 * Validates email domain (@2fresh.cz only)
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
    const { email, name } = body

    // Validate email presence
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email domain
    if (!email.endsWith('@2fresh.cz')) {
      return NextResponse.json(
        { error: 'Only @2fresh.cz email addresses are allowed' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = createServerAdminClient()

    // Check if user already exists
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id, email, is_team_member')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (checkError) {
      console.error('[API] Error checking existing user:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing user' },
        { status: 500 }
      )
    }

    // If user exists and is already a team member, return error
    if (existing && existing.is_team_member) {
      return NextResponse.json(
        { error: 'User is already a team member' },
        { status: 400 }
      )
    }

    let newUser

    // If user exists but is not a team member, reactivate them
    if (existing) {
      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          is_team_member: true,
          name: name || null,
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (updateError) {
        console.error('[API] Error reactivating user:', updateError)
        return NextResponse.json(
          { error: 'Failed to reactivate user' },
          { status: 500 }
        )
      }

      newUser = data
      console.log(`[API] Reactivated team member: ${newUser.email}`)
    } else {
      // Create new user with team member access
      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          email: email.toLowerCase(),
          name: name || null,
          is_team_member: true,
        })
        .select()
        .single()

      if (insertError) {
        console.error('[API] Error creating user:', insertError)
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }

      newUser = data
      console.log(`[API] Created new team member: ${newUser.email}`)
    }

    // Log to audit log
    await supabase.from('audit_log').insert({
      user_email: session.user.email,
      action: 'add_team_member',
      entity_type: 'user',
      entity_id: newUser.id,
      details: {
        email: newUser.email,
        name: newUser.name,
      },
    })

    console.log(`[API] Team member added: ${newUser.email} by ${session.user.email}`)

    return NextResponse.json({
      success: true,
      user: newUser,
    })
  } catch (error) {
    console.error('[API] Add team member error:', error)
    return NextResponse.json(
      {
        error: 'Failed to add team member',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

/**
 * API Route: DELETE /api/admin/team-members
 *
 * Removes team member access (soft delete - sets is_team_member to false)
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
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerAdminClient()

    // Get user details before removal for audit log
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, name, is_team_member')
      .eq('id', userId)
      .maybeSingle()

    if (fetchError) {
      console.error('[API] Error fetching user for removal:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent self-removal
    if (user.email === session.user.email) {
      return NextResponse.json(
        { error: 'You cannot remove yourself from the team' },
        { status: 400 }
      )
    }

    // Soft delete - set is_team_member to false (keeps user record)
    const { error: updateError } = await supabase
      .from('users')
      .update({ is_team_member: false })
      .eq('id', userId)

    if (updateError) {
      console.error('[API] Error removing team member access:', updateError)
      return NextResponse.json(
        { error: 'Failed to remove team member access' },
        { status: 500 }
      )
    }

    // Log to audit log
    await supabase.from('audit_log').insert({
      user_email: session.user.email,
      action: 'remove_team_member',
      entity_type: 'user',
      entity_id: userId,
      details: {
        email: user.email,
        name: user.name,
        action: 'revoked_team_member_access',
      },
    })

    console.log(`[API] Team member access revoked: ${user.email} by ${session.user.email}`)

    return NextResponse.json({
      success: true,
      message: 'Team member access revoked successfully',
    })
  } catch (error) {
    console.error('[API] Remove team member error:', error)
    return NextResponse.json(
      {
        error: 'Failed to remove team member',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
