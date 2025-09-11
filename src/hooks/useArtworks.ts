/**
 * Hook genérico para artworks com filtros
 */

import {
  ArtworkWithSeries,
  ProcessedArtwork,
  processArtwork
} from '@/types/artwork'
import { createClient } from '@/utils/supabase/client'
import { useQuery } from 'react-query'

interface UseArtworksOptions {
  featured?: boolean
  oneOfOne?: boolean
  seriesSlug?: string
  type?: 'single' | 'edition'
  limit?: number
  enabled?: boolean
}

export function useArtworks(options: UseArtworksOptions = {}) {
  const supabase = createClient()
  const {
    featured,
    oneOfOne,
    seriesSlug,
    type,
    limit,
    enabled = true
  } = options

  return useQuery({
    queryKey: ['artworks', options],
    queryFn: async (): Promise<ProcessedArtwork[]> => {
      let query = supabase
        .from('artworks')
        .select(
          `
          *,
          series_artworks(
            *,
            series(*)
          )
        `
        )
        .order('posted_at', { ascending: false })

      // Apply filters
      if (featured) {
        query = query.eq('is_featured', true)
      }

      if (oneOfOne) {
        query = query.eq('is_one_of_one', true)
      }

      if (type) {
        query = query.eq('type', type)
      }

      if (limit) {
        query = query.limit(limit)
      }

      // Handle series filter separately as it requires joins
      if (seriesSlug) {
        const { data: seriesData } = await supabase
          .from('series')
          .select('id')
          .eq('slug', seriesSlug)
          .single()

        if (seriesData) {
          const { data: seriesArtworks } = await supabase
            .from('series_artworks')
            .select('artwork_id')
            .eq('series_id', (seriesData as any).id)

          const artworkIds =
            (seriesArtworks as any[])?.map((sa) => sa.artwork_id) || []
          if (artworkIds.length > 0) {
            query = query.in('id', artworkIds)
          }
        }
      }

      const { data, error } = await query

      if (error) throw error

      return ((data as ArtworkWithSeries[]) || []).map(processArtwork)
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false
  })
}
