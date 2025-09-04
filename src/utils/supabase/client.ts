import { createBrowserClient } from '@supabase/ssr'
import {
  supabaseClientOptions,
  supabaseConfig
} from '@/lib/supabase/config'
import type { Database } from '@/types/supabase'

export function createClient() {
  const { url, anonKey } = supabaseConfig
  return createBrowserClient<Database>(url, anonKey, supabaseClientOptions)
}
