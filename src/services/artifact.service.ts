/**
 * Artifact Service - Server-side artifact data fetching
 *
 * Centralized service for artifact-related data operations.
 * Handles collectible content and special items.
 */

import type { Database } from '@/types/supabase'
import { createProductionClient } from '@/utils/supabase/server'
import { cache } from 'react'

// Type definitions
type DatabaseArtifact = Database['public']['Tables']['artifacts']['Row']

export interface ArtifactFilters {
  limit?: number
  orderBy?: 'created_at' | 'title'
  ascending?: boolean
}

export interface ProcessedArtifactData {
  artifacts: DatabaseArtifact[]
  total: number
  error: null | string
}

/**
 * Artifact Service Class
 */
export class ArtifactService {
  /**
   * Get all artifacts with filtering options
   */
  static getArtifacts = cache(
    async (filters: ArtifactFilters = {}): Promise<ProcessedArtifactData> => {
      const supabase = await createProductionClient()

      try {
        let query = supabase.from('artifacts').select('*')

        // Apply ordering
        const orderBy = filters.orderBy || 'created_at'
        const ascending = filters.ascending ?? false
        query = query.order(orderBy, { ascending })

        // Apply limit
        if (filters.limit) {
          query = query.limit(filters.limit)
        }

        const { data, error, count } = await query

        if (error) {
          console.error('Error fetching artifacts:', error)
          return {
            artifacts: [],
            total: 0,
            error: error.message
          }
        }

        return {
          artifacts: data || [],
          total: count || data?.length || 0,
          error: null
        }
      } catch (error) {
        console.error('Unexpected error in getArtifacts:', error)
        return {
          artifacts: [],
          total: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  )

  /**
   * Get artifact by ID
   */
  static getById = cache(async (id: string) => {
    const supabase = await createProductionClient()

    try {
      const { data, error } = await supabase
        .from('artifacts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching artifact by ID:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Unexpected error in getById:', error)
      return null
    }
  })

  /**
   * Get featured/highlighted artifacts for display
   */
  static getFeatured = cache(async (options: { limit?: number } = {}) => {
    return this.getArtifacts({
      limit: options.limit || 5,
      orderBy: 'created_at',
      ascending: false
    })
  })

  /**
   * Get artifacts for the artifacts page
   */
  static getForArtifactsPage = cache(async () => {
    try {
      const artifactsResult = await this.getArtifacts({
        orderBy: 'created_at',
        ascending: false
      })

      return {
        artifacts: artifactsResult.artifacts,
        error: artifactsResult.error
      }
    } catch (error) {
      console.error('Error fetching artifacts for page:', error)
      return {
        artifacts: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  /**
   * Get artifacts statistics
   */
  static getStats = cache(async () => {
    const supabase = await createProductionClient()

    try {
      const { count: totalArtifacts } = await supabase
        .from('artifacts')
        .select('*', { count: 'exact', head: true })

      return {
        total: totalArtifacts || 0
      }
    } catch (error) {
      console.error('Error fetching artifact stats:', error)
      return {
        total: 0
      }
    }
  })

  /**
   * Check if artifacts exist
   */
  static hasArtifacts = cache(async (): Promise<boolean> => {
    const supabase = await createProductionClient()

    try {
      const { count } = await supabase
        .from('artifacts')
        .select('*', { count: 'exact', head: true })
        .limit(1)

      return (count || 0) > 0
    } catch (error) {
      console.error('Error checking if artifacts exist:', error)
      return false
    }
  })
}
