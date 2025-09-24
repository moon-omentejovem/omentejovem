/**
 * Series Service - Server-side series data fetching
 *
 * Centralized service for all series-related data operations.
 * Optimized for server components with React cache and proper error handling.
 */

import type { Database } from '@/types/supabase'
import { getImageUrlFromSlug } from '@/utils/storage'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cache } from 'react'
import { BaseService } from './base.service'
import { ClientBaseService } from './client-base.service'

// Import types for collections response
interface CollectionRes {
  name: string
  year: string
  slug: string
  nftSlugs: string[]
  coverImage?: string
}

interface CollectionsResponse {
  collections: CollectionRes[]
}

// Type definitions
type DatabaseSeries = Database['public']['Tables']['series']['Row']

export interface SeriesData extends DatabaseSeries {
  artwork_count?: number
}

export interface SeriesFilters {
  limit?: number
  orderBy?: 'created_at' | 'updated_at' | 'name'
  ascending?: boolean
}

export interface SeriesWithArtworks extends SeriesData {
  artworks: Array<{
    id: string
    title: string
    slug: string
  }>
}

export interface ProcessedSeriesData {
  series: SeriesData[]
  error: null | string
}

/**
 * Series Service Class
 */
export class SeriesService extends BaseService {
  /**
   * Get all series with optional filtering
   */
  static getSeries = cache(async (): Promise<ProcessedSeriesData> => {
    return this.executeQuery(async (supabase) => {
      const { data, error } = await supabase
        .from('series')
        .select(
          `
          *,
          series_artworks(count)
        `
        )
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching series:', error)
        return {
          series: [],
          error: error.message
        }
      }

      // Process series data to include artwork count
      const processedSeries = (data || []).map((series) => ({
        ...series,
        artwork_count: (series as any).series_artworks?.length || 0
      })) as SeriesData[]

      return {
        series: processedSeries,
        error: null
      }
    }, 'getSeries')
  })

  /**
   * Get series by slug
   */
  static getBySlug = cache(async (slug: string): Promise<SeriesData | null> => {
    return this.safeExecuteQuery(async (supabase) => {
      const { data, error } = await supabase
        .from('series')
        .select(
          `
          *,
          series_artworks(count)
        `
        )
        .eq('slug', slug)
        .single()

      if (error) {
        console.error(`Error fetching series by slug "${slug}":`, error)
        return null
      }

      // Process series data to include artwork count
      const processedSeries = {
        ...data,
        artwork_count: (data as any).series_artworks?.length || 0
      } as SeriesData

      return processedSeries
    }, 'getBySlug')
  })

  /**
   * Get series metadata by slug (for SEO)
   */
  static getMetadataBySlug = cache(
    async (
      slug: string
    ): Promise<{
      name: string
      slug: string
    } | null> => {
      return this.safeExecuteQuery(async (supabase) => {
        const { data, error } = await supabase
          .from('series')
          .select('name, slug')
          .eq('slug', slug)
          .single()

        if (error) {
          console.error(
            `Error fetching series metadata by slug "${slug}":`,
            error
          )
          return null
        }

        return { name: data.name, slug: data.slug }
      }, 'getMetadataBySlug')
    }
  )

  /**
   * Check if series exists by slug (for static params generation)
   */
  static existsBySlug = cache(async (slug: string): Promise<boolean> => {
    return this.executeQuery(async (supabase) => {
      const { count } = await supabase
        .from('series')
        .select('*', { count: 'exact', head: true })
        .eq('slug', slug)

      return (count || 0) > 0
    }, 'existsBySlug')
  })

  /**
   * Get all series slugs for static generation
   */
  static getSlugs = cache(async (): Promise<string[]> => {
    const result = await this.safeExecuteQuery(async (supabase) => {
      const { data, error } = await supabase.from('series').select('slug')

      if (error) {
        console.error('Error fetching series slugs:', error)
        return []
      }

      return (data || [])
        .map((series) => series.slug)
        .filter(Boolean) as string[]
    }, 'getSlugs')

    return result || []
  })

  /**
   * Get series stats
   */
  static getStats = cache(async () => {
    return this.safeExecuteQuery(async (supabase) => {
      const { count } = await supabase
        .from('series')
        .select('*', { count: 'exact', head: true })

      return {
        total: count || 0
      }
    }, 'getStats')
  })

  /**
   * Get collections data for series page
   */
  static getCollectionsData = cache(async (): Promise<CollectionsResponse> => {
    const result = await this.safeExecuteQuery(async (supabase) => {
      const { data, error } = await supabase
        .from('series')
        .select(
          `
          name,
          slug,
          created_at,
          slug,
          series_artworks(
            artworks(
              id,
              slug
            )
          )
        `
        )
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching collections data:', error)
        return {
          collections: []
        }
      }

      // Process series data to match CollectionRes format
      const collections: CollectionRes[] = (data || []).map((series) => {
        // Extract year from created_at
        const year = series.created_at
          ? new Date(series.created_at).getFullYear().toString()
          : new Date().getFullYear().toString()

        // Get slugs from related artworks
        const artworks = (series as any).series_artworks || []
        const nftSlugs = artworks
          .map((sa: any) => sa.artworks?.slug)
          .filter(Boolean)

        // Generate cover image URL from series slug
        const coverImage = series.slug
          ? getImageUrlFromSlug(series.slug, 'series', 'optimized')
          : undefined

        return {
          name: series.name,
          year,
          slug: series.slug,
          nftSlugs,
          coverImage
        }
      })

      return {
        collections
      }
    }, 'getCollectionsData')

    return result || { collections: [] }
  })

  // ===============================
  // CLIENT-SIDE METHODS (for hooks)
  // ===============================

  /**
   * Get series with client-side Supabase client
   * Used in hooks and client components
   */
  static async getSeriesWithClient(
    client: SupabaseClient<Database>,
    filters: SeriesFilters = {}
  ): Promise<SeriesData[]> {
    const { limit, orderBy = 'created_at', ascending = false } = filters

    return ClientBaseService.executeClientQuery(
      client,
      async (supabase) => {
        let query = supabase.from('series').select(`
            *,
            artwork_count:series_artworks(count)
          `)

        if (orderBy) {
          query = query.order(orderBy, { ascending })
        }

        if (limit) {
          query = query.limit(limit)
        }

        const { data, error } = await query

        if (error) {
          console.error('Error fetching series:', error)
          throw error
        }

        return (data || []).map((series) => ({
          ...series,
          artwork_count: Array.isArray(series.artwork_count)
            ? series.artwork_count.length
            : 0
        })) as SeriesData[]
      },
      'getSeriesWithClient'
    )
  }

  /**
   * Get series by slug with client-side Supabase client
   */
  static async getSeriesBySlugWithClient(
    client: SupabaseClient<Database>,
    slug: string
  ): Promise<SeriesWithArtworks | null> {
    return ClientBaseService.executeClientQuery(
      client,
      async (supabase) => {
        const { data, error } = await supabase
          .from('series')
          .select(
            `
            *,
            artworks:series_artworks(
              artwork:artworks(
                id,
                title,
                slug
              )
            )
          `
          )
          .eq('slug', slug)
          .single()

        if (error) {
          console.error('Error fetching series by slug:', error)
          throw error
        }

        if (!data) return null

        // Transform the data structure
        const transformedData: SeriesWithArtworks = {
          ...data,
          artworks: data.artworks
            ? data.artworks.map((item: any) => item.artwork).filter(Boolean)
            : []
        }

        return transformedData
      },
      'getSeriesBySlugWithClient'
    )
  }
}
