import {
  supabaseClientOptions,
  supabaseConfig
} from '@/lib/supabase/config'
import type { Database } from '@/types/supabase'
import { createClient } from '@supabase/supabase-js'

// Admin client with service role key
// Only use this on the server side for administrative operations
export const supabaseAdmin = createClient<Database>(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey,
  {
    ...supabaseClientOptions,
    auth: {
      ...supabaseClientOptions.auth,
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
