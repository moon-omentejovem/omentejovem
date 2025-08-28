import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/admin/users - List all users and their roles
export async function GET() {
  try {
    const supabase = await createClient()

    // Check if current user is admin
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: currentUserRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (currentUserRole?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get all users with their roles
    const { data: users, error: usersError } =
      await supabase.auth.admin.listUsers()

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Get roles for all users
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role')

    // Combine user data with roles
    const usersWithRoles = users.users.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      role: roles?.find((r) => r.user_id === u.id)?.role || 'user'
    }))

    return NextResponse.json(usersWithRoles)
  } catch (error) {
    console.error('Error in /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Update user role
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { userId, role } = await request.json()

    // Check if current user is admin
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: currentUserRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (currentUserRole?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'Missing userId or role' },
        { status: 400 }
      )
    }

    // Update or insert user role
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role }, { onConflict: 'user_id' })

    if (error) {
      console.error('Error updating user role:', error)
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
