/**
 * Supabase Utils - Index
 *
 * Centralized exports for all Supabase utilities
 */

// Client creation utilities
export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient } from './server'

// Middleware utilities
// export { checkAdminAuth, handleAdminRoutes, updateSession } from './middleware'

// Re-export common types
export type { Database } from '@/types/supabase'
