/**
 * Artwork Service - Server-side artwork data fetching
 *
 * Centralized service for all artwork-related data operations.
 * Optimized for server components with React cache and proper error handling.
 */

import { type Artwork, type ArtworkWithSeries } from '@/types/artwork'
import type { Database } from '@/types/supabase'
import { getPublicUrl } from '@/utils/storage'
import { cache } from 'react'
import { BaseService } from './base.service'

// Type definitions
type DatabaseArtwork = Database['public']['Tables']['artworks']['Row']
type DatabaseSeries = Database['public']['Tables']['series']['Row']

export interface ArtworkFilters {
  limit?: number
  featured?: boolean
  oneOfOne?: boolean
  type?: 'single' | 'edition'
  seriesSlug?: string
  random?: boolean
  orderBy?: 'posted_at' | 'mint_date' | 'created_at'
  ascending?: boolean
}

export interface ArtworkWithRelations extends DatabaseArtwork {
  series_artworks?: Array<{
    series: DatabaseSeries
  }>
}

export interface ArtworkData {
  artworks: Artwork[]
  total: number
  error: null | string
}

/**
 * Process image URLs for server-side rendering
 * Ensures all image URLs are resolved on the server before sending to client
 */
function processArtworkImages(artwork: any): any {
  return {
    ...artwork,
    // Process optimized image URL
    image_url: artwork.image_path
      ? getPublicUrl(artwork.image_path)
      : artwork.image_url,
    // Process raw image URL
    raw_image_url: artwork.raw_image_path
      ? getPublicUrl(artwork.raw_image_path)
      : artwork.raw_image_url,
    // Ensure paths are preserved for potential client-side use
    image_path: artwork.image_path,
    raw_image_path: artwork.raw_image_path
  }
}

/**
 * Artwork Service Class
 */
export class ArtworkService extends BaseService {
  /**
   * Get artworks with flexible filtering options
   */
  static getArtworks = cache(
    async (filters: ArtworkFilters = {}): Promise<ArtworkData> => {
      return this.executeQuery(async (supabase) => {
        let query = supabase.from('artworks').select(`
          *,
          series_artworks(
            series(
              id,
              name,
              slug,
              cover_image_url
            )
          )
        `)

        // Apply filters
        if (filters.featured !== undefined) {
          query = query.eq('is_featured', filters.featured)
        }

        if (filters.oneOfOne !== undefined) {
          query = query.eq('is_one_of_one', filters.oneOfOne)
        }

        if (filters.type) {
          query = query.eq('type', filters.type)
        }

        // Series filter requires a subquery
        if (filters.seriesSlug) {
          const { data: seriesData } = await supabase
            .from('series')
            .select('id')
            .eq('slug', filters.seriesSlug)
            .single<{ id: number }>()

          if (seriesData) {
            const { data: artworkIds } = await supabase
              .from('series_artworks')
              .select('artwork_id')
              .eq('series_id', String(seriesData.id))

            if (artworkIds && artworkIds.length > 0) {
              const ids = artworkIds.map((item: any) => item.artwork_id)
              query = query.in('id', ids)
            }
          }
        }

        // Apply ordering
        const orderBy = filters.orderBy || 'posted_at'
        const ascending = filters.ascending ?? false
        query = query.order(orderBy, { ascending })

        // Apply limit
        if (filters.limit) {
          query = query.limit(filters.limit)
        }

        const { data, error, count } = await query

        if (error) {
          console.error('Error fetching artworks:', error)
          return {
            artworks: [],
            total: 0,
            error: error.message
          }
        }

        const artworks = (data || []).map(
          processArtworkImages
        ) as ArtworkWithSeries[]

        // Apply random shuffle if requested
        if (filters.random) {
          artworks.sort(() => Math.random() - 0.5)
        }

        return {
          artworks,
          total: count || artworks.length,
          error: null
        }
      }, 'getArtworks')
    }
  )

  /**
   * Get featured artworks for homepage
   */
  static getFeatured = cache(
    async (options: { limit?: number; random?: boolean } = {}) => {
      return this.getArtworks({
        featured: true,
        limit: options.limit || 10,
        random: options.random
      })
    }
  )

  /**
   * Get one-of-one artworks
   */
  static getOneOfOne = cache(async (options: { limit?: number } = {}) => {
    return this.getArtworks({
      oneOfOne: true,
      type: 'single',
      limit: options.limit
    })
  })

  /**
   * Get edition artworks
   */
  static getEditions = cache(async (options: { limit?: number } = {}) => {
    return this.getArtworks({
      type: 'edition',
      limit: options.limit
    })
  })

  /**
   * Get all portfolio artworks with optional filters
   */
  static getPortfolio = cache(
    async (
      filters: {
        type?: 'single' | 'edition'
        seriesSlug?: string
        featured?: boolean
        oneOfOne?: boolean
        limit?: number
      } = {}
    ) => {
      return this.getArtworks(filters)
    }
  )

  /**
   * Get artworks by series slug
   */
  static getBySeriesSlug = cache(
    async (seriesSlug: string, options: { limit?: number } = {}) => {
      return this.getArtworks({
        seriesSlug,
        limit: options.limit
      })
    }
  )

  /**
   * Get single artwork by slug
   */
  static getBySlug = cache(async (slug: string) => {
    return this.safeExecuteQuery(async (supabase) => {
      const { data, error } = await supabase
        .from('artworks')
        .select(
          `
          *,
          series_artworks(
            series(
              id,
              name,
              slug,
              cover_image_url
            )
          )
        `
        )
        .eq('slug', slug)
        .single()

      if (error) {
        console.error('Error fetching artwork by slug:', error)
        return null
      }

      return data ? (processArtworkImages(data) as ArtworkWithSeries) : null
    }, 'getBySlug')
  })

  /**
   * Get artworks for a specific series context (used in series detail pages)
   */
  static getForSeriesPage = cache(
    async (seriesSlug: string, selectedArtworkSlug?: string) => {
      const artworksResult = await this.getBySeriesSlug(seriesSlug)

      if (artworksResult.error || artworksResult.artworks.length === 0) {
        return {
          artworks: [],
          selectedIndex: -1,
          error: artworksResult.error || 'No artworks found for this series'
        }
      }

      let selectedIndex = 0
      if (selectedArtworkSlug) {
        const index = artworksResult.artworks.findIndex(
          (artwork) => artwork.slug === selectedArtworkSlug
        )
        if (index !== -1) {
          selectedIndex = index
        }
      }

      return {
        artworks: artworksResult.artworks,
        selectedIndex,
        error: null
      }
    }
  )

  /**
   * Get homepage data - optimized for landing page
   */
  static getHomepageData = cache(async () => {
    try {
      // Fetch featured artworks for the homepage carousel
      const featured = await this.getFeatured({ limit: 10, random: true })

      return {
        featuredArtworks: featured.artworks,
        error: featured.error
      }
    } catch (error) {
      console.error('Error fetching homepage data:', error)
      return {
        featuredArtworks: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  /**
   * Get artwork statistics
   */
  static getStats = cache(async () => {
    return this.executeQuery(async (supabase) => {
      const [
        { count: totalArtworks },
        { count: featuredCount },
        { count: oneOfOneCount },
        { count: editionCount }
      ] = await Promise.all([
        supabase.from('artworks').select('*', { count: 'exact', head: true }),
        supabase
          .from('artworks')
          .select('*', { count: 'exact', head: true })
          .eq('is_featured', true),
        supabase
          .from('artworks')
          .select('*', { count: 'exact', head: true })
          .eq('is_one_of_one', true),
        supabase
          .from('artworks')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'edition')
      ])

      return {
        total: totalArtworks || 0,
        featured: featuredCount || 0,
        oneOfOne: oneOfOneCount || 0,
        editions: editionCount || 0
      }
    }, 'getStats')
  })
}
