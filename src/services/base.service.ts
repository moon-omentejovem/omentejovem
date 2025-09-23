/**
 * Base Service - Centralized Supabase client management
 *
 * This service provides a single point of access to Supabase for all other services.
 * Handles production-safe client creation and error management.
 */

import type { Database } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Base Service Class
 * All other services should extend this class to access Supabase
 */
export class BaseService {
  /**
   * Get production-safe Supabase client for server context
   * Only to be used in server components and API routes
   */
  protected static async getServerSupabaseClient(): Promise<
    SupabaseClient<Database>
  > {
    // Use dynamic import to avoid build-time issues
    const { createBuildSupabaseClient, createServerSupabaseClient } =
      await import('@/utils/supabase/server')

    try {
      // Try to use the server client (works in runtime)
      return await createServerSupabaseClient()
    } catch (error) {
      // Check if it's the specific static generation context error
      if (
        error instanceof Error &&
        error.message === 'STATIC_GENERATION_CONTEXT'
      ) {
        // Silently fallback to build client during static generation
        return createBuildSupabaseClient()
      }

      // For other errors, log and fallback
      console.debug(
        'Falling back to build client due to server client error:',
        error
      )
      return createBuildSupabaseClient()
    }
  }

  /**
   * Execute a Supabase query with standardized error handling
   * For server context - auto-gets server client
   */
  protected static async executeQuery<T>(
    queryFn: (client: SupabaseClient<Database>) => Promise<T>,
    errorContext?: string
  ): Promise<T> {
    try {
      const client = await this.getServerSupabaseClient()
      return await queryFn(client)
    } catch (error) {
      const context = errorContext ? ` in ${errorContext}` : ''
      console.error(`Supabase query error${context}:`, error)
      throw error
    }
  }

  /**
   * Execute a Supabase query with graceful error handling (returns null on error)
   */
  protected static async safeExecuteQuery<T>(
    queryFn: (client: SupabaseClient<Database>) => Promise<T>,
    errorContext?: string
  ): Promise<T | null> {
    try {
      return await this.executeQuery(queryFn, errorContext)
    } catch (error) {
      return null
    }
  }
}
