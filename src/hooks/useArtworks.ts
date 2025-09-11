/**
 * React Query hooks for Artworks CRUD operations
 */

import { fetchArtworkBySlug, fetchArtworks } from '@/lib/supabase'
import { TABLES } from '@/lib/supabase/config'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
import { createClient } from '@/utils/supabase/client'
import { useMutation, useQuery, useQueryClient } from 'react-query'

type Artwork = Tables<'artworks'>
type ArtworkInsert = TablesInsert<'artworks'>
type ArtworkUpdate = TablesUpdate<'artworks'>

// Query Keys
export const artworkKeys = {
  all: ['artworks'] as const,
  lists: () => [...artworkKeys.all, 'list'] as const,
  list: (filters: any) => [...artworkKeys.lists(), filters] as const,
  details: () => [...artworkKeys.all, 'detail'] as const,
  detail: (slug: string) => [...artworkKeys.details(), slug] as const
}

/**
 * Hook para buscar todos os artworks com filtros opcionais
 */
export function useArtworks(options?: {
  featured?: boolean
  oneOfOne?: boolean
  limit?: number
  seriesSlug?: string
  enabled?: boolean
}) {
  return useQuery({
    queryKey: artworkKeys.list(options),
    queryFn: () => fetchArtworks(options),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000 // 10 minutos
  })
}

/**
 * Hook para buscar artwork por slug
 */
export function useArtworkBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: artworkKeys.detail(slug),
    queryFn: () => fetchArtworkBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  })
}

/**
 * Hook para buscar artworks em destaque
 */
export function useFeaturedArtworks(limit?: number) {
  return useArtworks({
    featured: true,
    limit
  })
}

/**
 * Hook para buscar artworks 1/1
 */
export function useOneOfOneArtworks(limit?: number) {
  return useArtworks({
    oneOfOne: true,
    limit
  })
}

/**
 * Hook para buscar artworks de uma série específica
 */
export function useArtworksBySeries(seriesSlug: string, enabled = true) {
  return useArtworks({
    seriesSlug,
    enabled: enabled && !!seriesSlug
  })
}

/**
 * Hook para criar artwork (Admin)
 */
export function useCreateArtwork() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (artwork: ArtworkInsert) => {
      const { data, error } = await supabase
        .from(TABLES.ARTWORKS)
        .insert(artwork)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidar todas as queries de artworks
      queryClient.invalidateQueries(artworkKeys.all)
    }
  })
}

/**
 * Hook para atualizar artwork (Admin)
 */
export function useUpdateArtwork() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & ArtworkUpdate) => {
      const { data, error } = await supabase
        .from(TABLES.ARTWORKS)
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      // Invalidar todas as queries de artworks
      queryClient.invalidateQueries(artworkKeys.all)
      // Atualizar cache específico do artwork
      if (data.slug) {
        queryClient.setQueryData(artworkKeys.detail(data.slug), data)
      }
    }
  })
}

/**
 * Hook para deletar artwork (Admin)
 */
export function useDeleteArtwork() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(TABLES.ARTWORKS)
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      // Invalidar todas as queries de artworks
      queryClient.invalidateQueries(artworkKeys.all)
    }
  })
}

/**
 * Hook para buscar artwork com paginação
 */
export function useArtworksPaginated(
  page: number = 1,
  pageSize: number = 12,
  filters?: {
    featured?: boolean
    oneOfOne?: boolean
    seriesSlug?: string
  }
) {
  const supabase = createClient()

  return useQuery({
    queryKey: artworkKeys.list({ page, pageSize, ...filters }),
    queryFn: async () => {
      const offset = (page - 1) * pageSize

      let query = supabase.from(TABLES.ARTWORKS).select(
        `
          *,
          series_artworks(
            series(*)
          )
        `,
        { count: 'exact' }
      )

      // Aplicar filtros
      if (filters?.featured) {
        query = query.eq('is_featured', true)
      }

      if (filters?.oneOfOne) {
        query = query.eq('is_one_of_one', true)
      }

      if (filters?.seriesSlug) {
        query = query.eq('series_artworks.series.slug', filters.seriesSlug)
      }

      // Aplicar paginação e ordenação
      query = query
        .order('posted_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      const { data, error, count } = await query

      if (error) throw error

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000
  })
}
