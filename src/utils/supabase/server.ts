import { supabaseClientOptions, supabaseConfig } from '@/lib/supabase/config'
import type { Database } from '@/types/supabase'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      ...supabaseClientOptions,
      auth: {
        ...supabaseClientOptions.auth,
        persistSession: false,
        autoRefreshToken: false
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        }
      }
    }
  )
}

/**
 * Create a simple client for build-time operations like generateStaticParams
 * This doesn't rely on cookies and can be used safely during build
 */
export function createBuildClient() {
  return createSupabaseClient<Database>(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  )
}
