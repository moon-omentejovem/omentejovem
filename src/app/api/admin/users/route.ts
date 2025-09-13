import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/admin/users - List all CMS users (all are admins)
export async function GET() {
  try {
    // Verify current user is admin
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: currentUserRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (currentUserRole?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get all users with admin roles
    const { data: adminUsers, error } = await supabaseAdmin
      .from('user_roles')
      .select(
        `
        user_id,
        role,
        created_at,
        updated_at
      `
      )
      .eq('role', 'admin')

    if (error) {
      console.error('Error fetching admin users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Get auth data for these users
    const usersWithDetails = []

    for (const adminUser of adminUsers) {
      try {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
          adminUser.user_id || ''
        )
        if (authUser.user) {
          usersWithDetails.push({
            id: adminUser.user_id,
            email: authUser.user.email,
            role: 'admin', // All CMS users are admins
            created_at: authUser.user.created_at,
            cms_added_at: adminUser.created_at
          })
        }
      } catch (authError) {
        // User might have been deleted from auth but role still exists
        console.warn(
          `Auth user ${adminUser.user_id} not found, but role exists`
        )
        usersWithDetails.push({
          id: adminUser.user_id,
          email: 'Unknown (user deleted)',
          role: 'admin',
          created_at: adminUser.created_at,
          cms_added_at: adminUser.created_at,
          auth_deleted: true
        })
      }
    }

    return NextResponse.json({
      users: usersWithDetails,
      total: usersWithDetails.length,
      admins: usersWithDetails.length // All are admins
    })
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users - Remove user from CMS (remove admin role)
export async function DELETE(request: Request) {
  try {
    // Verify current user is admin
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: currentUserRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (currentUserRole?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Prevent admin from removing themselves
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot remove your own admin access' },
        { status: 400 }
      )
    }

    // Remove user role (this removes their CMS access)
    const { error } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error removing user role:', error)
      return NextResponse.json(
        { error: 'Failed to remove user from CMS' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
