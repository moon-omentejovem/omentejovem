/**
 * Supabase Server Client
 *
 * This creates a Supabase client configured for server-side use.
 * It handles cookie-based session management for Server Components,
 * Route Handlers, and Server Actions.
 *
 * @usage Use this in:
 * - Server Components
 * - API routes
 * - Server Actions
 * - Middleware
 */

import { supabaseConfig } from '@/lib/supabase/config'
import type { Database } from '@/types/supabase'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
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
  })
}

/**
 * Create Supabase client for Server Actions and Route Handlers
 * This variant ensures cookie changes are properly handled
 */
export async function createServerActionClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        }
      }
    }
  )
}
