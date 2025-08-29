import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Verify current user is admin
    const supabase = await createClient()
    const {
      data: { user: currentUser },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify current user is admin
    const { data: currentUserRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUser.id)
      .single()

    if (currentUserRole?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Try to find if user already exists in auth
    try {
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = authUsers.users.find((u) => u.email === email)

      if (existingUser) {
        // User exists in auth, check/create admin role
        const { data: existingRole } = await supabaseAdmin
          .from('user_roles')
          .select('*')
          .eq('user_id', existingUser.id)
          .single()

        if (existingRole) {
          return NextResponse.json({
            message: 'User is already a CMS admin',
            user: { id: existingUser.id, email: existingUser.email },
            alreadyAdmin: true
          })
        } else {
          // Create admin role for existing user
          const { error: insertError } = await supabaseAdmin
            .from('user_roles')
            .insert({
              user_id: existingUser.id,
              role: 'admin'
            })

          if (insertError) {
            console.error('Error creating admin role:', insertError)
            return NextResponse.json(
              { error: 'Failed to create admin role' },
              { status: 500 }
            )
          }

          return NextResponse.json({
            message: 'User added to CMS as admin',
            user: { id: existingUser.id, email: existingUser.email }
          })
        }
      } else {
        // User doesn't exist in auth yet, they'll become admin after first login
        return NextResponse.json({
          message:
            'Magic link sent to new user - they will become admin after first login',
          email: email,
          pending: true
        })
      }
    } catch (error) {
      console.error('Error in invite admin:', error)
      return NextResponse.json(
        { error: 'Failed to process invitation' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in invite admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
