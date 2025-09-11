/**
 * React Query hooks for Series CRUD operations
 */

import { fetchSeries, fetchSeriesBySlug } from '@/lib/supabase'
import { TABLES } from '@/lib/supabase/config'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
import { createClient } from '@/utils/supabase/client'
import { useMutation, useQuery, useQueryClient } from 'react-query'

type Series = Tables<'series'>
type SeriesInsert = TablesInsert<'series'>
type SeriesUpdate = TablesUpdate<'series'>

// Query Keys
export const seriesKeys = {
  all: ['series'] as const,
  lists: () => [...seriesKeys.all, 'list'] as const,
  list: (filters: any) => [...seriesKeys.lists(), filters] as const,
  details: () => [...seriesKeys.all, 'detail'] as const,
  detail: (slug: string) => [...seriesKeys.details(), slug] as const
}

/**
 * Hook para buscar todas as séries
 */
export function useSeries(options?: {
  includeArtworks?: boolean
  enabled?: boolean
}) {
  return useQuery({
    queryKey: seriesKeys.list(options),
    queryFn: () => fetchSeries(options),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000 // 10 minutos
  })
}

/**
 * Hook para buscar série por slug
 */
export function useSeriesBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: seriesKeys.detail(slug),
    queryFn: () => fetchSeriesBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  })
}

/**
 * Hook para buscar séries com artworks incluídos
 */
export function useSeriesWithArtworks() {
  return useSeries({
    includeArtworks: true
  })
}

/**
 * Hook para criar série (Admin)
 */
export function useCreateSeries() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (series: SeriesInsert) => {
      const { data, error } = await supabase
        .from(TABLES.SERIES)
        .insert(series)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidar todas as queries de séries
      queryClient.invalidateQueries(seriesKeys.all)
    }
  })
}

/**
 * Hook para atualizar série (Admin)
 */
export function useUpdateSeries() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & SeriesUpdate) => {
      const { data, error } = await supabase
        .from(TABLES.SERIES)
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      // Invalidar todas as queries de séries
      queryClient.invalidateQueries(seriesKeys.all)
      // Atualizar cache específico da série
      if (data.slug) {
        queryClient.setQueryData(seriesKeys.detail(data.slug), data)
      }
    }
  })
}

/**
 * Hook para deletar série (Admin)
 */
export function useDeleteSeries() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TABLES.SERIES).delete().eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      // Invalidar todas as queries de séries
      queryClient.invalidateQueries(seriesKeys.all)
    }
  })
}

/**
 * Hook para adicionar artwork a uma série (Admin)
 */
export function useAddArtworkToSeries() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      seriesId,
      artworkId
    }: {
      seriesId: string
      artworkId: string
    }) => {
      const { data, error } = await supabase
        .from(TABLES.SERIES_ARTWORKS)
        .insert({
          series_id: seriesId,
          artwork_id: artworkId
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries(seriesKeys.all)
      queryClient.invalidateQueries(['artworks'])
    }
  })
}

/**
 * Hook para remover artwork de uma série (Admin)
 */
export function useRemoveArtworkFromSeries() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      seriesId,
      artworkId
    }: {
      seriesId: string
      artworkId: string
    }) => {
      const { error } = await supabase
        .from(TABLES.SERIES_ARTWORKS)
        .delete()
        .eq('series_id', seriesId)
        .eq('artwork_id', artworkId)

      if (error) throw error
      return { seriesId, artworkId }
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries(seriesKeys.all)
      queryClient.invalidateQueries(['artworks'])
    }
  })
}

/**
 * Hook para buscar artworks de uma série específica
 */
export function useSeriesArtworks(seriesId: string, enabled = true) {
  const supabase = createClient()

  return useQuery({
    queryKey: [...seriesKeys.detail(seriesId), 'artworks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.SERIES_ARTWORKS)
        .select(
          `
          artworks(*)
        `
        )
        .eq('series_id', seriesId)

      if (error) throw error
      return data?.map((item) => item.artworks).filter(Boolean) || []
    },
    enabled: enabled && !!seriesId,
    staleTime: 5 * 60 * 1000
  })
}
