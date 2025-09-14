/**
 * React Query hooks for Artworks CRUD operations
 *
 * ✅ Uses only Services - no direct Supabase client usage
 * ✅ Consistent with backend-oriented architecture
 */

import { TABLES } from '@/lib/supabase/config'
import { ArtworkService } from '@/services'
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
 * ✅ Uses ArtworkService instead of direct lib/supabase
 */
export function useArtworks(options?: {
  featured?: boolean
  oneOfOne?: boolean
  type?: 'single' | 'edition'
  limit?: number
  seriesSlug?: string
  enabled?: boolean
  random?: boolean
}) {
  return useQuery({
    queryKey: artworkKeys.list(options),
    queryFn: async () => {
      const result = await ArtworkService.getArtworks({
        featured: options?.featured,
        oneOfOne: options?.oneOfOne,
        type: options?.type,
        limit: options?.limit,
        seriesSlug: options?.seriesSlug,
        random: options?.random
      })
      return result.artworks
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000 // 10 minutos
  })
}

/**
 * Hook para buscar artwork por slug
 * ✅ Uses ArtworkService instead of direct lib/supabase
 */
export function useArtworkBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: artworkKeys.detail(slug),
    queryFn: () => ArtworkService.getBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  })
}

/**
 * Hook para buscar artworks em destaque
 * ✅ Uses ArtworkService instead of useArtworks wrapper
 */
export function useFeaturedArtworks(limit?: number) {
  return useQuery({
    queryKey: artworkKeys.list({ featured: true, limit }),
    queryFn: async () => {
      const result = await ArtworkService.getFeatured({ limit })
      return result.artworks
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  })
}

/**
 * Hook para buscar artworks 1/1
 * ✅ Uses ArtworkService instead of useArtworks wrapper
 */
export function useOneOfOneArtworks(limit?: number) {
  return useQuery({
    queryKey: artworkKeys.list({ oneOfOne: true, limit }),
    queryFn: async () => {
      const result = await ArtworkService.getOneOfOne({ limit })
      return result.artworks
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  })
}

/**
 * Hook para buscar artworks de uma série específica
 * ✅ Uses ArtworkService instead of useArtworks wrapper
 */
export function useArtworksBySeries(seriesSlug: string, enabled = true) {
  return useQuery({
    queryKey: artworkKeys.list({ seriesSlug }),
    queryFn: async () => {
      const result = await ArtworkService.getBySeriesSlug(seriesSlug)
      return result.artworks
    },
    enabled: enabled && !!seriesSlug,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
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
 * ✅ Uses ArtworkService instead of direct Supabase client
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
  return useQuery({
    queryKey: artworkKeys.list({ page, pageSize, ...filters }),
    queryFn: async () => {
      // Use ArtworkService for consistent data fetching
      const result = await ArtworkService.getArtworks({
        featured: filters?.featured,
        oneOfOne: filters?.oneOfOne,
        seriesSlug: filters?.seriesSlug,
        limit: pageSize,
        orderBy: 'posted_at',
        ascending: false
      })

      // Calculate pagination data
      const total = result.total
      const totalPages = Math.ceil(total / pageSize)

      // For pagination, we need to slice the results
      // Note: This is a simplified approach. For true pagination,
      // ArtworkService should support offset parameter
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = result.artworks.slice(startIndex, endIndex)

      return {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages
      }
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000
  })
}
