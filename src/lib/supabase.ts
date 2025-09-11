/**
 * Client-side Supabase helper functions
 *
 * @warning Use createClient from utils/supabase/client for browser context
 * @warning Use createClient from utils/supabase/server for server components
 *
 * This file provides typed helper functions for common database operations
 */

import { TABLES } from '@/lib/supabase/config'
import type { Database } from '@/types/supabase'
import { createClient } from '@/utils/supabase/client'

// Client-side helper functions - use only in client components
const supabase = createClient()

/**
 * Generic function to fetch data from any table
 */
export async function fetchTable<T>(
  table: keyof Database['public']['Tables'],
  options?: {
    select?: string
    orderBy?: string
    ascending?: boolean
    limit?: number
  }
): Promise<T[]> {
  let query = supabase.from(table as any).select(options?.select || '*')

  if (options?.orderBy) {
    query = query.order(options.orderBy, {
      ascending: options.ascending ?? false
    })
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error(`Error fetching ${String(table)}:`, error)
    throw new Error(`Failed to fetch ${String(table)}: ${error.message}`)
  }

  return (data as T[]) || []
}

/**
 * Fetch artworks with related series data
 */
export async function fetchArtworks(options?: {
  featured?: boolean
  oneOfOne?: boolean
  limit?: number
  seriesSlug?: string
  type?: 'single' | 'edition'
}) {
  const { processArtwork } = await import('@/types/artwork')

  // If filtering by seriesSlug, we need a different approach
  if (options?.seriesSlug) {
    // First, get artwork IDs for this series
    const { data: seriesArtworks, error: seriesError } = await supabase
      .from(TABLES.SERIES_ARTWORKS)
      .select(
        `
        artwork_id,
        series!inner(slug)
      `
      )
      .eq('series.slug', options.seriesSlug)

    if (seriesError) {
      console.error('Error fetching series artworks:', seriesError)
      throw new Error(`Failed to fetch series artworks: ${seriesError.message}`)
    }

    const artworkIds =
      seriesArtworks
        ?.map((sa) => sa.artwork_id)
        .filter((id): id is string => id !== null) || []

    if (artworkIds.length === 0) {
      return []
    }

    // Now get the full artworks with series data
    let query = supabase
      .from(TABLES.ARTWORKS)
      .select(
        `
        *,
        series_artworks(
          series(*)
        )
      `
      )
      .in('id', artworkIds)

    // Apply other filters
    if (options?.featured) {
      query = query.eq('is_featured', true)
    }

    if (options?.oneOfOne) {
      query = query.eq('is_one_of_one', true)
    }

    if (options?.type) {
      query = query.eq('type', options.type)
    }

    // Apply ordering and limit
    query = query.order('posted_at', { ascending: false })

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching artworks:', error)
      throw new Error(`Failed to fetch artworks: ${error.message}`)
    }

    // Process raw data to ProcessedArtwork format
    return ((data as any[]) || []).map(processArtwork)
  }

  // Standard query without seriesSlug filter
  let query = supabase.from(TABLES.ARTWORKS).select(`
      *,
      series_artworks(
        series(*)
      )
    `)

  // Apply filters
  if (options?.featured) {
    query = query.eq('is_featured', true)
  }

  if (options?.oneOfOne) {
    query = query.eq('is_one_of_one', true)
  }

  if (options?.type) {
    query = query.eq('type', options.type)
  }

  // Apply ordering and limit
  query = query.order('posted_at', { ascending: false })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching artworks:', error)
    throw new Error(`Failed to fetch artworks: ${error.message}`)
  }

  // Process raw data to ProcessedArtwork format
  return ((data as any[]) || []).map(processArtwork)
} /**
 * Fetch single artwork by slug
 */
export async function fetchArtworkBySlug(slug: string) {
  const { data, error } = await supabase
    .from(TABLES.ARTWORKS)
    .select(
      `
      *,
      series_artworks(
        series(*)
      )
    `
    )
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching artwork:', error)
    throw new Error(`Failed to fetch artwork: ${error.message}`)
  }

  return data
}

/**
 * Fetch series with related artworks data
 */
export async function fetchSeries(options?: { includeArtworks?: boolean }) {
  let selectQuery = '*'

  if (options?.includeArtworks) {
    selectQuery = `
      *,
      series_artworks(
        artworks(*)
      )
    `
  }

  const { data, error } = await supabase
    .from(TABLES.SERIES)
    .select(selectQuery)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching series:', error)
    throw new Error(`Failed to fetch series: ${error.message}`)
  }

  return data || []
}

/**
 * Fetch single series by slug
 */
export async function fetchSeriesBySlug(slug: string) {
  const { data, error } = await supabase
    .from(TABLES.SERIES)
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
    console.error('Error fetching series:', error)
    throw new Error(`Failed to fetch series: ${error.message}`)
  }

  return data
}

/**
 * Fetch artifacts
 */
export async function fetchArtifacts() {
  return fetchTable(TABLES.ARTIFACTS, {
    orderBy: 'created_at',
    ascending: false
  })
}

/**
 * Fetch about page content (singleton)
 */
export async function fetchAboutPage() {
  const { data, error } = await supabase
    .from(TABLES.ABOUT_PAGE)
    .select('*')
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching about page:', error)
    return null
  }

  return data
}

// Export the client for direct use when needed
export { supabase }
