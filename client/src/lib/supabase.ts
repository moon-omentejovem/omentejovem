// Client-side Supabase helper functions
// Use createClient from utils/supabase/client for browser context
// Use createClient from utils/supabase/server for server components
import type { Database } from '@/types/supabase'
import { createClient } from '@/utils/supabase/client'

// Client-side helper functions - use only in client components
const supabase = createClient()

export async function fetchTable<T>(
  table: keyof Database['public']['Tables']
): Promise<T[]> {
  const { data, error } = await supabase.from(table as any).select('*')

  if (error) {
    console.error(`Error fetching ${String(table)}:`, error)
    return []
  }

  return data as T[]
}

export async function fetchArtworks() {
  const { data, error } = await supabase
    .from('artworks')
    .select(
      `
      *,
      series_artworks(
        series(*)
      )
    `
    )
    .order('posted_at', { ascending: false })

  if (error) {
    console.error('Error fetching artworks:', error)
    return []
  }

  return data
}

export async function fetchSeries() {
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
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching series:', error)
    return []
  }

  return data
}

export async function fetchArtifacts() {
  const { data, error } = await supabase
    .from('artifacts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching artifacts:', error)
    return []
  }

  return data
}

export async function fetchAboutPage() {
  const { data, error } = await supabase
    .from('about_page')
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
