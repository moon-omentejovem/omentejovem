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

import {
  supabaseClientOptions,
  supabaseConfig
} from '@/lib/supabase/config'
import type { Database } from '@/types/supabase'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const { url, anonKey } = supabaseConfig
  return createBrowserClient<Database>(url, anonKey, supabaseClientOptions)
}
