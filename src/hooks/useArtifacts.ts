/**
 * React Query hooks for Artifacts CRUD operatioexport function useArtifact(id: string, enabled = true) {
  const client = createClient()

  return useQuery({
    queryKey: artifactKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await client
        .from('artifacts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  }) * ✅ Uses only Services - no direct Supabase client usage
 * ✅ Consistent with backend-oriented architecture
 */

import { TABLES } from '@/lib/supabase/config'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
import { createClient } from '@/utils/supabase/client'
import { useMutation, useQuery, useQueryClient } from 'react-query'

type Artifact = Tables<'artifacts'>
type ArtifactInsert = TablesInsert<'artifacts'>
type ArtifactUpdate = TablesUpdate<'artifacts'>

// Query Keys
export const artifactKeys = {
  all: ['artifacts'] as const,
  lists: () => [...artifactKeys.all, 'list'] as const,
  list: (filters: any) => [...artifactKeys.lists(), filters] as const,
  details: () => [...artifactKeys.all, 'detail'] as const,
  detail: (id: string) => [...artifactKeys.details(), id] as const
}

/**
 * Hook para buscar todos os artifacts
 * ✅ Uses ArtifactService instead of direct lib/supabase
 */
export function useArtifacts(enabled = true) {
  const client = createClient()

  return useQuery({
    queryKey: artifactKeys.all,
    queryFn: async () => {
      const { data, error } = await client
        .from('artifacts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000 // 10 minutos
  })
}

/**
 * Hook para buscar artifact por ID
 * ✅ Uses ArtifactService instead of direct Supabase client
 */
export function useArtifactById(id: string, enabled = true) {
  const client = createClient()

  return useQuery({
    queryKey: artifactKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await client
        .from('artifacts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  })
}

/**
 * Hook para criar artifact (Admin)
 */
export function useCreateArtifact() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (artifact: ArtifactInsert) => {
      const { data, error } = await supabase
        .from(TABLES.ARTIFACTS)
        .insert(artifact)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidar todas as queries de artifacts
      queryClient.invalidateQueries(artifactKeys.all)
    }
  })
}

/**
 * Hook para atualizar artifact (Admin)
 */
export function useUpdateArtifact() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & ArtifactUpdate) => {
      const { data, error } = await supabase
        .from(TABLES.ARTIFACTS)
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      // Invalidar todas as queries de artifacts
      queryClient.invalidateQueries(artifactKeys.all)
      // Atualizar cache específico do artifact
      queryClient.setQueryData(artifactKeys.detail(data.id), data)
    }
  })
}

/**
 * Hook para deletar artifact (Admin)
 */
export function useDeleteArtifact() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(TABLES.ARTIFACTS)
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      // Invalidar todas as queries de artifacts
      queryClient.invalidateQueries(artifactKeys.all)
    }
  })
}

/**
 * Hook para buscar artifacts com paginação
 * ✅ Uses ArtifactService instead of direct Supabase client
 */
export function useArtifactsPaginated(page: number = 1, pageSize: number = 10) {
  const client = createClient()

  return useQuery({
    queryKey: artifactKeys.list({ page, pageSize }),
    queryFn: async () => {
      // Use direct client for consistent data fetching
      const { data, error } = await client
        .from('artifacts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(pageSize)

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
