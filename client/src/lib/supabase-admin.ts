import type { Database } from '@/types/supabase'
import { createClient } from '@supabase/supabase-js'

// Admin client with service role key
// Only use this on the server side for administrative operations
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
