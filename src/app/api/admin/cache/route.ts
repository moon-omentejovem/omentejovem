import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DEFAULT_TTL_DAYS = 10
const DEFAULT_TTL_SECONDS = DEFAULT_TTL_DAYS * 24 * 60 * 60
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

export async function GET(request: NextRequest) {
  try {
    const auth = await ensureAdmin(request)
    if (auth.error) {
      return auth.error
    }

    const { data, error } = await supabaseAdmin
      .from('cache_settings' as any)
      .select('*')
      .eq('key', SETTINGS_KEY)
      .limit(1)
      .single()

    if (error && (error as any).code !== 'PGRST116') {
      throw error
    }

    if (error && (error as any).code === 'PGRST116') {
      return NextResponse.json({
        cacheTtlSeconds: DEFAULT_TTL_SECONDS,
        cacheTtlDays: DEFAULT_TTL_DAYS,
        lastClearedAt: null,
        updatedAt: null
      })
    }

    const ttlSeconds =
      typeof (data as any).cache_ttl_seconds === 'number' &&
      (data as any).cache_ttl_seconds >= 0
        ? (data as any).cache_ttl_seconds
        : DEFAULT_TTL_SECONDS

    return NextResponse.json({
      cacheTtlSeconds: ttlSeconds,
      cacheTtlDays: Math.round(ttlSeconds / (24 * 60 * 60)),
      lastClearedAt: (data as any).last_cleared_at ?? null,
      updatedAt: (data as any).updated_at ?? null
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load cache configuration' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await ensureAdmin(request)
    if (auth.error) {
      return auth.error
    }

    const body = await request.json()
    const rawDays = Number(body.cacheTtlDays)

    if (Number.isNaN(rawDays) || rawDays < 0) {
      return NextResponse.json(
        { error: 'cacheTtlDays must be a non-negative number' },
        { status: 400 }
      )
    }

    const ttlSeconds = Math.round(rawDays * 24 * 60 * 60)
    const now = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('cache_settings' as any)
      .upsert(
        {
          key: SETTINGS_KEY,
          cache_ttl_seconds: ttlSeconds,
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
      cacheTtlSeconds: ttlSeconds,
      cacheTtlDays: Math.round(ttlSeconds / (24 * 60 * 60)),
      lastClearedAt: (data as any).last_cleared_at ?? null,
      updatedAt: (data as any).updated_at ?? now
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save cache configuration' },
      { status: 500 }
    )
  }
}

