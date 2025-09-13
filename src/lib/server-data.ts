/**
 * Server-side data fetching utilities for SSR
 *
 * These functions are designed to be used in Server Components only.
 * They provide simplified, cached data fetching without React Query complexity.
 */

import { ArtworkService, SeriesService } from '@/services'
import type { Artwork } from '@/types/artwork'

/**
 * Page data structure for portfolio pages
 */
export interface PortfolioPageData {
  artworks: Artwork[]
  selectedIndex?: number
  totalCount: number
  error?: string
}

/**
 * Get homepage artworks (featured + random selection)
 */
export async function getHomepageData(): Promise<PortfolioPageData> {
  try {
    const result = await ArtworkService.getHomepageData()

    if (result.error) {
      return {
        artworks: [],
        totalCount: 0,
        error: result.error
      }
    }

    return {
      artworks: result.featuredArtworks,
      totalCount: result.featuredArtworks.length,
      selectedIndex: 0
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return {
      artworks: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get one-of-one artworks
 */
export async function getOneOfOneData(): Promise<PortfolioPageData> {
  try {
    const result = await ArtworkService.getOneOfOne()

    if (result.error) {
      return {
        artworks: [],
        totalCount: 0,
        error: result.error
      }
    }

    return {
      artworks: result.artworks,
      totalCount: result.total,
      selectedIndex: -1 // Start with grid view
    }
  } catch (error) {
    console.error('Error fetching one-of-one data:', error)
    return {
      artworks: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get editions artworks
 */
export async function getEditionsData(): Promise<PortfolioPageData> {
  try {
    const result = await ArtworkService.getEditions()

    if (result.error) {
      return {
        artworks: [],
        totalCount: 0,
        error: result.error
      }
    }

    return {
      artworks: result.artworks,
      totalCount: result.total,
      selectedIndex: -1 // Start with grid view
    }
  } catch (error) {
    console.error('Error fetching editions data:', error)
    return {
      artworks: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get portfolio artworks with optional filters from searchParams
 */
export async function getPortfolioData(searchParams?: {
  type?: 'single' | 'edition'
  series?: string
  featured?: string
  slug?: string
}): Promise<PortfolioPageData> {
  try {
    const filters: any = {}

    if (searchParams?.type) {
      filters.type = searchParams.type
    }

    if (searchParams?.series) {
      filters.seriesSlug = searchParams.series
    }

    if (searchParams?.featured === 'true') {
      filters.featured = true
    }

    const result = await ArtworkService.getPortfolio(filters)

    if (result.error) {
      return {
        artworks: [],
        totalCount: 0,
        error: result.error
      }
    }

    // Find selected artwork index if slug is provided
    let selectedIndex = -1
    if (searchParams?.slug) {
      selectedIndex = result.artworks.findIndex(
        (artwork) => artwork.slug === searchParams.slug
      )
    }

    return {
      artworks: result.artworks,
      totalCount: result.total,
      selectedIndex
    }
  } catch (error) {
    console.error('Error fetching portfolio data:', error)
    return {
      artworks: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get series page data with artworks
 */
export async function getSeriesPageData(
  seriesSlug: string,
  artworkSlug?: string
): Promise<PortfolioPageData & { seriesInfo?: any }> {
  try {
    const [seriesResult, artworksResult] = await Promise.all([
      SeriesService.getBySlug(seriesSlug),
      ArtworkService.getForSeriesPage(seriesSlug, artworkSlug)
    ])

    if (artworksResult.error) {
      return {
        artworks: [],
        totalCount: 0,
        error: artworksResult.error
      }
    }

    return {
      artworks: artworksResult.artworks,
      totalCount: artworksResult.artworks.length,
      selectedIndex: artworksResult.selectedIndex,
      seriesInfo: seriesResult
    }
  } catch (error) {
    console.error('Error fetching series page data:', error)
    return {
      artworks: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get single artwork data (for individual artwork pages)
 */
export async function getArtworkData(slug: string): Promise<{
  artwork: Artwork | null
  error?: string
}> {
  try {
    const artwork = await ArtworkService.getBySlug(slug)

    if (!artwork) {
      return {
        artwork: null,
        error: 'Artwork not found'
      }
    }

    return {
      artwork
    }
  } catch (error) {
    console.error('Error fetching artwork data:', error)
    return {
      artwork: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
