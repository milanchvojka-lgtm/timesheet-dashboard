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

    // Fetch all users
    const supabase = createServerAdminClient()
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, created_at')
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
      .select('id, email')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (checkError) {
      console.error('[API] Error checking existing user:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing user' },
        { status: 500 }
      )
    }

    if (existing) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        name: name || null,
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
 * Removes a team member from the database
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

    // Get user details before deletion for audit log
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', userId)
      .maybeSingle()

    if (fetchError) {
      console.error('[API] Error fetching user for deletion:', fetchError)
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

    // Prevent self-deletion
    if (user.email === session.user.email) {
      return NextResponse.json(
        { error: 'You cannot remove yourself from the team' },
        { status: 400 }
      )
    }

    // Delete user
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteError) {
      console.error('[API] Error deleting user:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete user' },
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
      },
    })

    console.log(`[API] Team member removed: ${user.email} by ${session.user.email}`)

    return NextResponse.json({
      success: true,
      message: 'Team member removed successfully',
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
