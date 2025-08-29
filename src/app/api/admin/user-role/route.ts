import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/admin/user-role - Check current user's role
export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ role: null, isAdmin: false }, { status: 401 })
    }

    // Get user role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError) {
      // User doesn't have a role assigned yet
      return NextResponse.json({
        role: 'user',
        isAdmin: false,
        user: {
          id: user.id,
          email: user.email
        }
      })
    }

    const isAdmin = roleData.role === 'admin'

    return NextResponse.json({
      role: roleData.role,
      isAdmin,
      user: {
        id: user.id,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Error checking user role:', error)
    return NextResponse.json(
      { error: 'Failed to check user role' },
      { status: 500 }
    )
  }
}
