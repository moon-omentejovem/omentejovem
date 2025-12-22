import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SETTINGS_KEY = 'images_proxy'

async function ensureAdmin(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: currentUserRole } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (currentUserRole?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Access denied' }, { status: 403 }) }
  }

  return { user }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await ensureAdmin(request)
    if (auth.error) {
      return auth.error
    }

    const now = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('cache_settings' as any)
      .upsert(
        {
          key: SETTINGS_KEY,
          last_cleared_at: now,
          updated_at: now
        },
        { onConflict: 'key' } as any
      )
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      lastClearedAt: (data as any).last_cleared_at ?? now,
      updatedAt: (data as any).updated_at ?? now
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}

