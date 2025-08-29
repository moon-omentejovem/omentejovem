/**
 * Client-side Supabase helper functions
 *
 * @warning Use createClient from utils/supabase/client for browser context
 * @warning Use createClient from utils/supabase/server for server components
 *
 * This file provides typed helper functions for common database operations
 */

import type { Database } from '@/types/supabase'
import { createClient } from '@/utils/supabase/client'
import { TABLES } from './supabase-config'

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
}) {
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

  if (options?.seriesSlug) {
    query = query.eq('series_artworks.series.slug', options.seriesSlug)
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

  return data || []
}

/**
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
