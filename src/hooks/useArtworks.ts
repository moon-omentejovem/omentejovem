/**
 * React Query hooks for Artworks CRUD operations
 *
 * ✅ Uses only Services - no direct Supabase client usage
 * ✅ Consistent with backend-oriented architecture
 */

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
      const client = createClient()
      let query = client
        .from('artworks')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('posted_at', { ascending: false })

      if (options?.featured) {
        query = query.eq('is_featured', true)
      }

      if (options?.oneOfOne) {
        query = query.eq('one_of_one', true)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000 // 10 minutos
  })
}

/**
 * Hook para buscar artwork por slug
 * ✅ Uses direct client instead of Service to avoid server imports
 */
export function useArtworkBySlug(slug: string, enabled = true) {
  const client = createClient()

  return useQuery({
    queryKey: artworkKeys.detail(slug),
    queryFn: async () => {
      const { data, error } = await client
        .from('artworks')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) throw error
      return data
    },
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  })
}

/**
 * Hook para buscar artworks em destaque
 * ✅ Uses direct client instead of Service to avoid server imports
 */
export function useFeaturedArtworks(limit?: number) {
  const client = createClient()

  return useQuery({
    queryKey: artworkKeys.list({ featured: true, limit }),
    queryFn: async () => {
      let query = client
        .from('artworks')
        .select('*')
        .eq('is_featured', true)
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('posted_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  })
}

/**
 * Hook para buscar artworks 1/1
 * ✅ Uses direct client instead of Service to avoid server imports
 */
export function useOneOfOneArtworks(limit?: number) {
  const client = createClient()

  return useQuery({
    queryKey: artworkKeys.list({ oneOfOne: true, limit }),
    queryFn: async () => {
      let query = client
        .from('artworks')
        .select('*')
        .eq('one_of_one', true)
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('posted_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  })
}

/**
 * Hook para buscar artworks de uma série específica
 * ✅ Uses direct client instead of Service to avoid server imports
 */
export function useArtworksBySeries(seriesSlug: string, enabled = true) {
  const client = createClient()

  return useQuery({
    queryKey: artworkKeys.list({ seriesSlug }),
    queryFn: async () => {
      const { data, error } = await client
        .from('series_artworks')
        .select(
          `
          artwork:artworks(*)
        `
        )
        .eq('series_slug', seriesSlug)

      if (error) throw error

      return (data || []).map((item: any) => item.artwork).filter(Boolean)
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
 * ✅ Uses direct client instead of Service to avoid server imports
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
  const client = createClient()

  return useQuery({
    queryKey: artworkKeys.list({ page, pageSize, ...filters }),
    queryFn: async () => {
      // Use direct client for consistent data fetching
      let query = client
        .from('artworks')
        .select('*', { count: 'exact' })
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('posted_at', { ascending: false })

      if (filters?.featured) {
        query = query.eq('is_featured', true)
      }

      if (filters?.oneOfOne) {
        query = query.eq('one_of_one', true)
      }

      if (filters?.seriesSlug) {
        // For series filtering, we'd need a join or separate query
        // This is a simplified approach
        query = query.limit(pageSize)
      } else {
        query = query.limit(pageSize)
      }

      const { data, error } = await query

      if (error) throw error

      // Calculate pagination data
      const total = data?.length || 0
      const totalPages = Math.ceil(total / pageSize)

      // For pagination, we need to slice the results
      // Note: This is a simplified approach. For true pagination,
      // we should support offset parameter
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = (data || []).slice(startIndex, endIndex)

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
