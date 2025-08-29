import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the user by email from auth.users table
    const { data: authUsers, error: authError } =
      await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      console.error('Error fetching auth users:', authError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    const user = authUsers.users.find((u) => u.email === email)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in auth system' },
        { status: 404 }
      )
    }

    console.log('Found user:', { id: user.id, email: user.email })

    // Check if user role exists
    const { data: existingRole, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (roleError && roleError.code !== 'PGRST116') {
      // PGRST116 = not found
      return NextResponse.json(
        { error: 'Failed to check user role' },
        { status: 500 }
      )
    }

    if (existingRole) {
      return NextResponse.json({
        message: 'User role already exists',
        role: existingRole,
        user: { id: user.id, email: user.email }
      })
    }

    // Create admin role for user
    const { data: newRole, error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role: 'admin'
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create user role' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Admin role created successfully',
      role: newRole,
      user: { id: user.id, email: user.email }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    // List all users with their roles
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select('*')

    if (error) {
      return NextResponse.json(
        {
          error: 'Failed to fetch user roles',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }

    // Get auth users for comparison
    const { data: authUsers, error: authError } =
      await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      return NextResponse.json(
        {
          error: 'Failed to fetch auth users',
          details: authError.message,
          userRoles: userRoles || []
        },
        { status: 500 }
      )
    }

    const usersWithRoles = authUsers.users.map((user) => {
      const role = userRoles.find((r) => r.user_id === user.id)
      return {
        id: user.id,
        email: user.email,
        role: role?.role || 'none',
        created_at: user.created_at
      }
    })

    const result = {
      users: usersWithRoles,
      total: usersWithRoles.length,
      admins: usersWithRoles.filter((u) => u.role === 'admin').length
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
