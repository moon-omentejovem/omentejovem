import { supabaseClientOptions, supabaseConfig } from '@/lib/supabase/config'
import type { Database } from '@/types/supabase'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Create server-side Supabase client with cookie support
 * For use in Server Components and API routes
 */
export async function createServerSupabaseClient() {
  // Check if cookies() is available (not available during static generation)
  try {
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
  } catch (error) {
    // cookies() is not available, likely during static generation
    // Throw a specific error that can be caught and handled
    throw new Error('STATIC_GENERATION_CONTEXT')
  }
}

/**
 * Create build-time Supabase client without cookie dependencies
 * For use during static generation (generateStaticParams, etc.)
 */
export function createBuildSupabaseClient() {
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

// Export backward compatibility aliases
export const createClient = createServerSupabaseClient
export const createBuildClient = createBuildSupabaseClient
