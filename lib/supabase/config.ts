/**
 * Supabase Configuration
 * Centralized configuration for Supabase client instances
 */

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
} as const

// Validate required environment variables on client-side
export function validateClientEnv() {
  const requiredEnvVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  } as const

  const missingEnvVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    )
  }
}

// Supabase client options
export const supabaseClientOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application': 'omentejovem-cms'
    }
  }
} as const

// Database table names (for type safety)
export const TABLES = {
  ARTWORKS: 'artworks',
  SERIES: 'series',
  SERIES_ARTWORKS: 'series_artworks',
  ARTIFACTS: 'artifacts',
  ABOUT_PAGE: 'about_page',
  USER_ROLES: 'user_roles'
} as const

// Storage bucket names
export const STORAGE_BUCKETS = {
  MEDIA: 'media',
  CACHED_IMAGES: 'cached-images'
} as const

// RLS policies
export const POLICIES = {
  READ_PUBLIC: 'read_public',
  WRITE_ADMINS: 'write_admins'
} as const
