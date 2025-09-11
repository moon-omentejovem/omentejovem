/**
 * React Query hooks for Artifacts CRUD operations
 */

import { fetchArtifacts } from '@/lib/supabase'
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
 */
export function useArtifacts(enabled = true) {
  return useQuery({
    queryKey: artifactKeys.all,
    queryFn: fetchArtifacts,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000 // 10 minutos
  })
}

/**
 * Hook para buscar artifact por ID
 */
export function useArtifactById(id: string, enabled = true) {
  const supabase = createClient()

  return useQuery({
    queryKey: artifactKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.ARTIFACTS)
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
 */
export function useArtifactsPaginated(page: number = 1, pageSize: number = 10) {
  const supabase = createClient()

  return useQuery({
    queryKey: artifactKeys.list({ page, pageSize }),
    queryFn: async () => {
      const offset = (page - 1) * pageSize

      const { data, error, count } = await supabase
        .from(TABLES.ARTIFACTS)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

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
