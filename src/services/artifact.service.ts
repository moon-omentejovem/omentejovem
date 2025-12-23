/**
 * Artifact Service - Server-side artifact data fetching
 *
 * Centralized service for all artifact-related data operations.
 * Optimized for server components with React cache and proper error handling.
 */

import type { Database } from '@/types/supabase'
import { cache } from 'react'
import { BaseService } from './base.service'

// Type definitions
type DatabaseArtifact = Database['public']['Tables']['artifacts']['Row']
type DatabaseArtifactInternalPage =
  Database['public']['Tables']['artifact_internal_pages']['Row']

export interface ArtifactData extends DatabaseArtifact {}
export interface ArtifactInternalPageData
  extends DatabaseArtifactInternalPage {}

export interface ProcessedArtifactData {
  artifacts: ArtifactData[]
  total: number
  error: null | string
}

export interface ArtifactFilters {
  limit?: number
  orderBy?: 'created_at' | 'updated_at' | 'title'
  ascending?: boolean
  status?: 'draft' | 'published' | 'all'
  includesDrafts?: boolean
}

/**
 * Artifact Service Class
 */
export class ArtifactService extends BaseService {
  /**
   * Get all artifacts with optional filtering
   */
  static getArtifacts = cache(
    async (filters: ArtifactFilters = {}): Promise<ProcessedArtifactData> => {
      return this.executeQuery(async (supabase) => {
        let query = supabase.from('artifacts').select('*')

        // Status filter - default to 'published' for public access
        if (filters.status === 'draft') {
          query = query.eq('status', 'draft')
        } else if (filters.status === 'published') {
          query = query.eq('status', 'published')
        } else if (filters.status !== 'all' && !filters.includesDrafts) {
          // Default behavior: only published for public access
          query = query.eq('status', 'published')
        }

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
          artifacts: (data || []) as ArtifactData[],
          total: count || (data || []).length,
          error: null
        }
      }, 'getArtifacts')
    }
  )

  /**
   * Get artifact by ID
   */
  static getById = cache(async (id: string): Promise<ArtifactData | null> => {
    return this.safeExecuteQuery(async (supabase) => {
      const { data, error } = await supabase
        .from('artifacts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error(`Error fetching artifact by ID "${id}":`, error)
        return null
      }

      return data as ArtifactData
    }, 'getById')
  })

  /**
   * Get featured artifacts
   */
  static getFeatured = cache(
    async (
      options: { limit?: number } = {}
    ): Promise<ProcessedArtifactData> => {
      return this.getArtifacts({
        limit: options.limit || 10,
        orderBy: 'created_at',
        ascending: false
      })
    }
  )

  /**
   * Get artifacts stats
   */
  static getStats = cache(async () => {
    return this.safeExecuteQuery(async (supabase) => {
      const { count } = await supabase
        .from('artifacts')
        .select('*', { count: 'exact', head: true })

      return {
        total: count || 0
      }
    }, 'getStats')
  })

  /**
   * Check if artifacts exist in database
   */
  static hasArtifacts = cache(async (): Promise<boolean> => {
    return this.executeQuery(async (supabase) => {
      const { count } = await supabase
        .from('artifacts')
        .select('*', { count: 'exact', head: true })
        .limit(1)

      return (count || 0) > 0
    }, 'hasArtifacts')
  })

  /**
   * Get artifacts data for artifacts page
   */
  static getForArtifactsPage = cache(
    async (): Promise<ProcessedArtifactData> => {
      return this.getArtifacts({
        orderBy: 'created_at',
        ascending: false
      })
    }
  )

  /**
   * Get artifact by slug (if slug field exists)
   */
  static getBySlug = cache(
    async (slug: string): Promise<ArtifactData | null> => {
      return this.safeExecuteQuery(async (supabase) => {
        // Since artifacts table doesn't have slug, we'll use title as identifier
        // This assumes title is unique and URL-friendly
        const { data, error } = await supabase
          .from('artifacts')
          .select('*')
          .eq('title', slug)
          .single()

        if (error) {
          console.error(`Error fetching artifact by slug "${slug}":`, error)
          return null
        }

        return data as ArtifactData
      }, 'getBySlug')
    }
  )

  /**
   * PUBLIC METHODS - Only published artifacts
   * Use these methods for public-facing pages
   */

  /**
   * Get published artifacts for public pages
   */
  static getPublishedArtifacts = cache(
    async (
      filters: Omit<ArtifactFilters, 'status' | 'includesDrafts'> = {}
    ): Promise<ProcessedArtifactData> => {
      return this.getArtifacts({
        ...filters,
        status: 'published'
      })
    }
  )

  /**
   * Get published artifacts for public artifacts page
   */
  static getPublishedForArtifactsPage = cache(
    async (): Promise<ProcessedArtifactData> => {
      return this.getPublishedArtifacts({
        orderBy: 'created_at',
        ascending: false
      })
    }
  )

  /**
   * ADMIN METHODS - All artifacts including drafts
   * Use these methods for admin pages
   */

  /**
   * Get all artifacts for admin interface
   */
  static getAdminArtifacts = cache(
    async (filters: ArtifactFilters = {}): Promise<ProcessedArtifactData> => {
      return this.getArtifacts({
        ...filters,
        includesDrafts: true
      })
    }
  )

  /**
   * Get published artifact internal page by slug
   */
  static async getInternalPageBySlug(
    slug: string
  ): Promise<ArtifactInternalPageData | null> {
    return this.safeExecuteQuery(async (supabase) => {
      const { data, error } = await supabase
        .from('artifact_internal_pages')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (error) {
        console.error(
          `Error fetching artifact internal page by slug "${slug}":`,
          error
        )
        return null
      }

      return data as ArtifactInternalPageData
    }, 'getInternalPageBySlug')
  }

  /**
   * Get all published artifact internal pages for navigation
   */
  static async getPublishedInternalPages(): Promise<
    ArtifactInternalPageData[]
  > {
    return this.executeQuery(async (supabase) => {
      const { data, error } = await supabase
        .from('artifact_internal_pages')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching artifact internal pages:', error)
        return []
      }

      return (data || []) as ArtifactInternalPageData[]
    }, 'getPublishedInternalPages')
  }
}
