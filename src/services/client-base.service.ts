/**
 * Client Base Service - Client-side Supabase operations
 *
 * Base service for client-side operations using the client Supabase instance.
 * Used by hooks and client components.
 */

import type { Database } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

export class ClientBaseService {
  /**
   * Execute a Supabase query with standardized error handling for client-side
   */
  public static async executeClientQuery<T>(
    client: SupabaseClient<Database>,
    queryFn: (client: SupabaseClient<Database>) => Promise<T>,
    errorContext?: string
  ): Promise<T> {
    try {
      return await queryFn(client)
    } catch (error) {
      const context = errorContext ? ` in ${errorContext}` : ''
      console.error(`Client Supabase query error${context}:`, error)
      throw error
    }
  }

  /**
   * Execute a client Supabase query with graceful error handling (returns null on error)
   */
  public static async safeExecuteClientQuery<T>(
    client: SupabaseClient<Database>,
    queryFn: (client: SupabaseClient<Database>) => Promise<T>,
    errorContext?: string
  ): Promise<T | null> {
    try {
      return await this.executeClientQuery(client, queryFn, errorContext)
    } catch (error) {
      return null
    }
  }
}
