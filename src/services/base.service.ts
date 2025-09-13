/**
 * Base Service - Centralized Supabase client management
 *
 * This service provides a single point of access to Supabase for all other services.
 * Handles production-safe client creation and error management.
 */

import type { Database } from '@/types/supabase'
import {
  createBuildSupabaseClient,
  createServerSupabaseClient
} from '@/utils/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Base Service Class
 * All other services should extend this class to access Supabase
 */
export class BaseService {
  /**
   * Get production-safe Supabase client
   * Automatically handles server vs build context
   */
  protected static async getSupabaseClient(): Promise<
    SupabaseClient<Database>
  > {
    try {
      // Try to use the server client (works in runtime)
      return await createServerSupabaseClient()
    } catch (error) {
      // Fallback to build client (works during static generation)
      console.debug(
        'Falling back to build client for static generation due to error in createServerSupabaseClient:',
        error
      )
      return createBuildSupabaseClient()
    }
  }

  /**
   * Execute a Supabase query with standardized error handling
   */
  protected static async executeQuery<T>(
    queryFn: (client: SupabaseClient<Database>) => Promise<T>,
    errorContext?: string
  ): Promise<T> {
    try {
      const client = await this.getSupabaseClient()
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
