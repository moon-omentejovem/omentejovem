/**
 * Supabase Configuration
 * Centralized configuration for Supabase client instances
 */

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

// Environment validation for client-side
export function validateClientEnv() {
  if (typeof window !== 'undefined') {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      throw new Error('Missing Supabase environment variables')
    }
  }
}
