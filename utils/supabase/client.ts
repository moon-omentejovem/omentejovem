/**
 * Supabase Browser Client
 *
 * This creates a Supabase client configured for browser/client-side use.
 * It automatically handles session management and authentication state.
 *
 * @usage Use this in:
 * - Client Components
 * - Browser-side code
 * - React hooks
 * - Event handlers
 */

import { supabaseClientOptions } from '@/lib/supabase-config'
import type { Database } from '@/types/supabase'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env file.'
    )
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey,
    supabaseClientOptions
  )
}
