/**
 * React Query hooks for About Page CRUD operations
 *
 * ✅ Uses only Services - no direct Supabase client usage
 * ✅ Consistent with backend-oriented architecture
 */

import { TABLES } from '@/lib/supabase/config'
import { AboutService } from '@/services'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
import { createClient } from '@/utils/supabase/client'
import { useMutation, useQuery, useQueryClient } from 'react-query'

type AboutPage = Tables<'about_page'>
type AboutPageInsert = TablesInsert<'about_page'>
type AboutPageUpdate = TablesUpdate<'about_page'>

// Query Keys
export const aboutPageKeys = {
  all: ['about-page'] as const,
  detail: () => [...aboutPageKeys.all, 'detail'] as const
}

/**
 * Hook para buscar conteúdo da página About
 * ✅ Uses AboutService instead of direct lib/supabase
 */
export function useAboutPage(enabled = true) {
  return useQuery({
    queryKey: aboutPageKeys.detail(),
    queryFn: async () => {
      const result = await AboutService.getAboutPageData()
      return result.aboutPage
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutos (conteúdo estático)
    cacheTime: 15 * 60 * 1000 // 15 minutos
  })
}

/**
 * Hook para criar conteúdo da página About (Admin)
 */
export function useCreateAboutPage() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (aboutPage: AboutPageInsert) => {
      const { data, error } = await supabase
        .from(TABLES.ABOUT_PAGE)
        .insert(aboutPage)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidar cache da página About
      queryClient.invalidateQueries(aboutPageKeys.all)
    }
  })
}

/**
 * Hook para atualizar conteúdo da página About (Admin)
 */
export function useUpdateAboutPage() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & AboutPageUpdate) => {
      const { data, error } = await supabase
        .from(TABLES.ABOUT_PAGE)
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      // Invalidar e atualizar cache da página About
      queryClient.invalidateQueries(aboutPageKeys.all)
      queryClient.setQueryData(aboutPageKeys.detail(), data)
    }
  })
}

/**
 * Hook para upsert (criar ou atualizar) conteúdo da página About (Admin)
 * Útil para páginas singleton como About
 */
export function useUpsertAboutPage() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (content: Omit<AboutPageInsert, 'id'>) => {
      const { data, error } = await supabase
        .from(TABLES.ABOUT_PAGE)
        .upsert({
          ...content,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      // Invalidar e atualizar cache da página About
      queryClient.invalidateQueries(aboutPageKeys.all)
      queryClient.setQueryData(aboutPageKeys.detail(), data)
    }
  })
}
