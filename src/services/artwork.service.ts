/**
 * Artwork Service - Server-side artwork data fetching
 *
 * Centralized service for all artwork-related data operations.
 * Optimized for server components with React cache and proper error handling.
 */

import { type Artwork, type ArtworkWithSeries } from '@/types/artwork'
import type { Database } from '@/types/supabase'
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
  status?: 'draft' | 'published' | 'all'
  includesDrafts?: boolean
  contract?: string
  network?: string
  year?: number
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
 * Process image URLs for server-side rendering using new slug-based system
 * Generates URLs dynamically from slug instead of relying on stored paths
 */
// Não processa mais campos de imagem: resolução via slug/id e helpers apenas no frontend/componente

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
              slug
            )
          )
        `)

        // Apply filters
        if (filters.contract) {
          query = query.eq('contract', filters.contract)
        }

        if (filters.network) {
          // Map network filter to blockchain field
          let blockchain = filters.network.toLowerCase()
          if (blockchain === 'eth') blockchain = 'ethereum'
          else if (blockchain === 'xtz') blockchain = 'tezos'
          
          query = query.eq('blockchain', blockchain)
        }

        if (filters.year) {
          // Filter by year using mint_date (primary)
          // We assume mint_date is the primary source of truth for the artwork year
          const startDate = `${filters.year}-01-01`
          const endDate = `${filters.year}-12-31`
          query = query.gte('mint_date', startDate).lte('mint_date', endDate)
        }

        if (filters.featured !== undefined) {
          query = query.eq('is_featured', filters.featured)
        }

        if (filters.oneOfOne !== undefined) {
          query = query.eq('is_one_of_one', filters.oneOfOne)
        }

        if (filters.type) {
          query = query.eq('type', filters.type)
        }

        // Status filter - default to 'published' for public access
        if (filters.status === 'draft') {
          query = query.eq('status', 'draft')
        } else if (filters.status === 'published') {
          query = query.eq('status', 'published')
        } else if (filters.status !== 'all' && !filters.includesDrafts) {
          // Default behavior: only published for public access
          query = query.eq('status', 'published')
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

        // Apply ordering (manual display_order first, then fallback)
        query = query.order('display_order', {
          ascending: true,
          nullsFirst: false
        })

        const orderBy = filters.orderBy || 'mint_date'
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

        const rawArtworks = (data || []).map(
          (artwork: any) => artwork
        ) as ArtworkWithSeries[]

        const withOrder = rawArtworks
          .filter((artwork) => artwork.display_order !== null && artwork.display_order !== undefined)
          .sort((a, b) => {
            const ao = a.display_order as number
            const bo = b.display_order as number
            if (ao === bo) {
              const ad = a.mint_date || a.posted_at || a.created_at || ''
              const bd = b.mint_date || b.posted_at || b.created_at || ''
              if (ad < bd) return 1
              if (ad > bd) return -1
              return 0
            }
            return ao - bo
          })

        const withoutOrder = rawArtworks
          .filter((artwork) => artwork.display_order === null || artwork.display_order === undefined)
          .sort((a, b) => {
            const ad = a.mint_date || a.posted_at || a.created_at || ''
            const bd = b.mint_date || b.posted_at || b.created_at || ''
            if (ad < bd) return 1
            if (ad > bd) return -1
            return 0
          })

        const totalArtworks = rawArtworks.length
        const positioned: ArtworkWithSeries[] = new Array(totalArtworks)

        for (const artwork of withOrder) {
          const orderValue = typeof artwork.display_order === 'number' ? artwork.display_order : 0
          let targetIndex = orderValue > 0 ? orderValue - 1 : 0
          if (targetIndex >= totalArtworks) {
            targetIndex = totalArtworks - 1
          }

          while (positioned[targetIndex] && targetIndex < totalArtworks - 1) {
            targetIndex += 1
          }

          if (!positioned[targetIndex]) {
            positioned[targetIndex] = artwork
          } else {
            const firstEmpty = positioned.findIndex((item) => !item)
            if (firstEmpty !== -1) {
              positioned[firstEmpty] = artwork
            } else {
              positioned.push(artwork)
            }
          }
        }

        let fillIndex = 0
        for (const artwork of withoutOrder) {
          while (fillIndex < positioned.length && positioned[fillIndex]) {
            fillIndex += 1
          }
          if (fillIndex >= positioned.length) {
            positioned.push(artwork)
          } else {
            positioned[fillIndex] = artwork
          }
        }

        const artworks = positioned.filter(Boolean)

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
   *
   * This method is intentionally not cached to ensure that updates
   * from the admin (like new videos) are reflected immediately
   * on public artwork pages.
   */
  static async getPortfolio(
    filters: {
      type?: 'single' | 'edition'
      seriesSlug?: string
      featured?: boolean
      oneOfOne?: boolean
      limit?: number
    } = {}
  ): Promise<ArtworkData> {
    return this.getArtworks(filters)
  }

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
              slug
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

      return data ? (data as ArtworkWithSeries) : null
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

  /**
   * PUBLIC METHODS - Only published artworks
   * Use these methods for public-facing pages
   */

  /**
   * Get published artworks for public pages
   */
  static getPublishedArtworks = cache(
    async (
      filters: Omit<ArtworkFilters, 'status' | 'includesDrafts'> = {}
    ): Promise<ArtworkData> => {
      return this.getArtworks({
        ...filters,
        status: 'published'
      })
    }
  )

  /**
   * Get published featured artworks for homepage
   */
  static getPublishedFeatured = cache(
    async (options: { limit?: number; random?: boolean } = {}) => {
      return this.getPublishedArtworks({
        featured: true,
        limit: options.limit || 10,
        random: options.random
      })
    }
  )

  /**
   * Get published one-of-one artworks
   */
  static getPublishedOneOfOne = cache(
    async (options: { limit?: number } = {}) => {
      return this.getPublishedArtworks({
        oneOfOne: true,
        type: 'single',
        limit: options.limit
      })
    }
  )

  /**
   * Get published edition artworks
   */
  static getPublishedEditions = cache(
    async (options: { limit?: number } = {}) => {
      return this.getPublishedArtworks({
        type: 'edition',
        limit: options.limit
      })
    }
  )

  /**
   * ADMIN METHODS - All artworks including drafts
   * Use these methods for admin pages
   */

  /**
   * Get all artworks for admin interface
   */
  static getAdminArtworks = cache(
    async (filters: ArtworkFilters = {}): Promise<ArtworkData> => {
      return this.getArtworks({
        ...filters,
        includesDrafts: true
      })
    }
  )
}
