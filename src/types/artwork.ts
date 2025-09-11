import type { Database } from './supabase'

// Base Supabase types
export type ArtworkRow = Database['public']['Tables']['artworks']['Row']
export type SeriesRow = Database['public']['Tables']['series']['Row']
export type SeriesArtworkRow =
  Database['public']['Tables']['series_artworks']['Row']

// Extended artwork with series relationship for portfolio display
export interface ArtworkWithSeries extends ArtworkRow {
  /**
   * Optimized image path stored on Supabase (optional while schema evolves)
   */
  image_cached_path?: string | null
  series_artworks: (SeriesArtworkRow & {
    series: SeriesRow
  })[]
}

// Image information for artwork display
export interface ArtworkImage {
  /**
   * Primary image URL for display (cached or original)
   */
  url: string
  /**
   * Original image URL from source (OpenSea, etc.)
   */
  originalUrl: string
  /**
   * Cached/optimized version URL
   */
  cachedUrl?: string
  /**
   * Thumbnail URL for previews
   */
  thumbnailUrl?: string
}

// Processed artwork for frontend consumption
export interface ProcessedArtwork {
  // Core artwork data
  id: string
  slug: string
  title: string
  description: any // JSON content from Tiptap

  // NFT/Token data
  tokenId: string
  mintDate?: string
  mintLink?: string
  type: 'single' | 'edition'
  editionsTotal?: number

  // Images
  image: ArtworkImage

  // Flags
  isFeatured: boolean
  isOneOfOne: boolean

  // Series/Collection info
  series: {
    name: string
    slug: string
  }[]

  // Metadata
  postedAt: string
  createdAt: string
  updatedAt: string
}

/**
 * Convert Supabase artwork to frontend-friendly format
 */
export function processArtwork(artwork: ArtworkWithSeries): ProcessedArtwork {
  const imageUrl = artwork.image_cached_path || artwork.image_url || ''

  return {
    id: artwork.id,
    slug: artwork.slug,
    title: artwork.title,
    description: artwork.description,

    tokenId: artwork.token_id || '',
    mintDate: artwork.mint_date || undefined,
    mintLink: artwork.mint_link || undefined,
    type: artwork.type as 'single' | 'edition',
    editionsTotal: artwork.editions_total || undefined,

    image: {
      url: imageUrl,
      originalUrl: artwork.image_url || '',
      cachedUrl: artwork.image_cached_path || undefined,
      thumbnailUrl: imageUrl // Same as main for now
    },

    isFeatured: artwork.is_featured ?? false,
    isOneOfOne: artwork.is_one_of_one ?? false,

    series:
      artwork.series_artworks
        ?.map((sa) => ({
          name: sa?.series?.name || 'Unknown Series',
          slug: sa?.series?.slug || 'unknown'
        }))
        .filter((s) => s.name !== 'Unknown Series') || [],

    postedAt: artwork.posted_at || artwork.created_at || '',
    createdAt: artwork.created_at || '',
    updatedAt: artwork.updated_at || artwork.created_at || ''
  }
}
