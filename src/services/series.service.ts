/**
 * Series Service - Server-side series data fetching
 *
 * Centralized service for all series-related data operations.
 * Handles collections, relationships with artworks, and series metadata.
 */

import { CollectionsResponse } from '@/api/resolver/types'
import type { Database } from '@/types/supabase'
import { createProductionClient } from '@/utils/supabase/server'
import { cache } from 'react'

// Type definitions
type DatabaseSeries = Database['public']['Tables']['series']['Row']
type DatabaseArtwork = Database['public']['Tables']['artworks']['Row']
type DatabaseSeriesArtwork =
  Database['public']['Tables']['series_artworks']['Row']

export interface SeriesFilters {
  limit?: number
  includeArtworks?: boolean
  includeArtworkCount?: boolean
  orderBy?: 'name' | 'created_at'
  ascending?: boolean
}

export interface SeriesWithArtworks extends DatabaseSeries {
  series_artworks?: Array<
    DatabaseSeriesArtwork & {
      artworks: DatabaseArtwork
    }
  >
  artwork_count?: number
}

export interface ProcessedSeriesData {
  series: SeriesWithArtworks[]
  total: number
  error: null | string
}

/**
 * Series Service Class
 */
export class SeriesService {
  /**
   * Get all series with flexible filtering options
   */
  static getSeries = cache(
    async (filters: SeriesFilters = {}): Promise<ProcessedSeriesData> => {
      const supabase = await createProductionClient()

      try {
        let selectQuery = '*'

        if (filters.includeArtworks) {
          selectQuery = `
          *,
          series_artworks(
            artworks(*)
          )
        `
        } else if (filters.includeArtworkCount) {
          selectQuery = `
          *,
          series_artworks(count)
        `
        }

        let query = supabase.from('series').select(selectQuery)

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
          console.error('Error fetching series:', error)
          return {
            series: [],
            total: 0,
            error: error.message
          }
        }

        return {
          series: data ? (data as unknown as SeriesWithArtworks[]) : [],
          total: count || data?.length || 0,
          error: null
        }
      } catch (error) {
        console.error('Unexpected error in getSeries:', error)
        return {
          series: [],
          total: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  )

  /**
   * Get series by slug with all related artworks
   */
  static getBySlug = cache(async (slug: string) => {
    const supabase = await createProductionClient()

    try {
      const { data, error } = await supabase
        .from('series')
        .select(
          `
          *,
          series_artworks(
            artworks(*)
          )
        `
        )
        .eq('slug', slug)
        .single()

      if (error) {
        console.error('Error fetching series by slug:', error)
        return null
      }

      return data as SeriesWithArtworks
    } catch (error) {
      console.error('Unexpected error in getBySlug:', error)
      return null
    }
  })

  /**
   * Get series list for collections page (legacy format compatibility)
   */
  static getCollectionsData = cache(async (): Promise<CollectionsResponse> => {
    try {
      const seriesResult = await this.getSeries({
        includeArtworks: true,
        orderBy: 'name',
        ascending: true
      })

      if (seriesResult.error) {
        console.error(
          'Error fetching series for collections:',
          seriesResult.error
        )
        return { collections: [] }
      }

      const collections = seriesResult.series.map((seriesItem) => ({
        name: seriesItem.name,
        year: seriesItem.created_at
          ? new Date(seriesItem.created_at).getFullYear().toString()
          : '',
        slug: seriesItem.slug,
        nftImageUrls:
          seriesItem.series_artworks?.map(
            (sa) => sa.artworks.image_url || ''
          ) || []
      }))

      return { collections }
    } catch (error) {
      console.error('Unexpected error in getCollectionsData:', error)
      return { collections: [] }
    }
  })

  /**
   * Get series metadata (name, description, etc.) by slug
   */
  static getMetadataBySlug = cache(async (slug: string) => {
    const supabase = await createProductionClient()

    try {
      const { data, error } = await supabase
        .from('series')
        .select('id, name, slug, cover_image_url, created_at, updated_at')
        .eq('slug', slug)
        .single()

      if (error) {
        console.error('Error fetching series metadata:', error)
        return null
      }

      return data as Pick<
        DatabaseSeries,
        'id' | 'name' | 'slug' | 'cover_image_url' | 'created_at' | 'updated_at'
      >
    } catch (error) {
      console.error('Unexpected error in getMetadataBySlug:', error)
      return null
    }
  })

  /**
   * Get series statistics
   */
  static getStats = cache(async () => {
    const supabase = await createProductionClient()

    try {
      const { count: totalSeries } = await supabase
        .from('series')
        .select('*', { count: 'exact', head: true })

      // Get series with artwork counts
      const { data: seriesWithCounts } = await supabase.from('series').select(`
          id,
          name,
          series_artworks(count)
        `)

      const avgArtworksPerSeries = seriesWithCounts
        ? seriesWithCounts.reduce((acc, series) => {
            const count = (series as any).series_artworks?.length || 0
            return acc + count
          }, 0) / seriesWithCounts.length
        : 0

      return {
        total: totalSeries || 0,
        avgArtworksPerSeries: Math.round(avgArtworksPerSeries * 100) / 100
      }
    } catch (error) {
      console.error('Error fetching series stats:', error)
      return {
        total: 0,
        avgArtworksPerSeries: 0
      }
    }
  })

  /**
   * Get series list for navigation/dropdown
   */
  static getForNavigation = cache(async () => {
    try {
      const seriesResult = await this.getSeries({
        limit: 20,
        orderBy: 'name',
        ascending: true
      })

      return seriesResult.series.map((series) => ({
        id: series.id,
        name: series.name,
        slug: series.slug
      }))
    } catch (error) {
      console.error('Error fetching series for navigation:', error)
      return []
    }
  })

  /**
   * Check if series exists by slug
   */
  static existsBySlug = cache(async (slug: string): Promise<boolean> => {
    const supabase = await createProductionClient()

    try {
      const { data, error } = await supabase
        .from('series')
        .select('id')
        .eq('slug', slug)
        .single()

      return !error && data !== null
    } catch (error) {
      return false
    }
  })
}
