/**
 * Main portfolio hooks - Aggregates and combines all data hooks
 */

import { TABLES } from '@/lib/supabase/config'
import { createClient } from '@/utils/supabase/client'
import { useQuery } from 'react-query'
import { useAboutPage } from './useAboutPage'
import { useArtifacts } from './useArtifacts'
import {
  useArtworks,
  useFeaturedArtworks,
  useOneOfOneArtworks
} from './useArtworks'
import { useDebounce } from './useDebounce'
import { useSeries } from './useSeries'

/**
 * Hook principal para dados do portfólio
 * Combina artworks, séries e artifacts em uma única query
 */
export function usePortfolioData() {
  const artworks = useArtworks()
  const series = useSeries()
  const artifacts = useArtifacts()
  const aboutPage = useAboutPage()

  return {
    artworks,
    series,
    artifacts,
    aboutPage,
    isLoading: artworks.isLoading || series.isLoading || artifacts.isLoading,
    error: artworks.error || series.error || artifacts.error
  }
}

/**
 * Hook para dados da homepage
 * Otimizado para carregar apenas o essencial da homepage
 */
export function useHomepageData() {
  const featuredArtworks = useFeaturedArtworks(6) // Limite de 6 para homepage
  const oneOfOneArtworks = useOneOfOneArtworks(3) // Limite de 3 para destaque
  const series = useSeries()

  return {
    featuredArtworks,
    oneOfOneArtworks,
    series,
    isLoading:
      featuredArtworks.isLoading ||
      oneOfOneArtworks.isLoading ||
      series.isLoading,
    error: featuredArtworks.error || oneOfOneArtworks.error || series.error
  }
}

/**
 * Hook para busca global no portfólio
 */
export function usePortfolioSearch(searchTerm: string, enabled = true) {
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const supabase = createClient()

  return useQuery({
    queryKey: ['portfolio-search', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm)
        return { artworks: [], series: [], artifacts: [] }

      const searchPattern = `%${debouncedSearchTerm}%`

      // Buscar em artworks
      const { data: artworks, error: artworksError } = await supabase
        .from(TABLES.ARTWORKS)
        .select(
          `
          *,
          series_artworks(
            series(*)
          )
        `
        )
        .or(
          `title.ilike.${searchPattern},description->>'text'.ilike.${searchPattern}`
        )
        .order('posted_at', { ascending: false })

      if (artworksError) throw artworksError

      // Buscar em series
      const { data: series, error: seriesError } = await supabase
        .from(TABLES.SERIES)
        .select('*')
        .ilike('name', searchPattern)
        .order('created_at', { ascending: false })

      if (seriesError) throw seriesError

      // Buscar em artifacts
      const { data: artifacts, error: artifactsError } = await supabase
        .from(TABLES.ARTIFACTS)
        .select('*')
        .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .order('created_at', { ascending: false })

      if (artifactsError) throw artifactsError

      return {
        artworks: artworks || [],
        series: series || [],
        artifacts: artifacts || []
      }
    },
    enabled:
      enabled && !!debouncedSearchTerm && debouncedSearchTerm.length >= 2,
    staleTime: 30 * 1000, // 30 segundos para busca
    cacheTime: 5 * 60 * 1000 // 5 minutos
  })
}

/**
 * Hook para filtrar artworks por múltiplos critérios
 */
export function useFilteredArtworks(filters: {
  featured?: boolean
  oneOfOne?: boolean
  seriesSlug?: string
  type?: string
  year?: number
  sortBy?: 'newest' | 'oldest' | 'title'
  limit?: number
}) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['filtered-artworks', filters],
    queryFn: async () => {
      let query = supabase.from(TABLES.ARTWORKS).select(`
          *,
          series_artworks(
            series(*)
          )
        `)

      // Aplicar filtros
      if (filters.featured !== undefined) {
        query = query.eq('is_featured', filters.featured)
      }

      if (filters.oneOfOne !== undefined) {
        query = query.eq('is_one_of_one', filters.oneOfOne)
      }

      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      if (filters.year) {
        const startDate = `${filters.year}-01-01`
        const endDate = `${filters.year}-12-31`
        query = query.gte('posted_at', startDate).lte('posted_at', endDate)
      }

      if (filters.seriesSlug) {
        query = query.eq('series_artworks.series.slug', filters.seriesSlug)
      }

      // Aplicar ordenação
      switch (filters.sortBy) {
        case 'oldest':
          query = query.order('posted_at', { ascending: true })
          break
        case 'title':
          query = query.order('title', { ascending: true })
          break
        case 'newest':
        default:
          query = query.order('posted_at', { ascending: false })
          break
      }

      // Aplicar limite
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    cacheTime: 5 * 60 * 1000 // 5 minutos
  })
}

/**
 * Hook para estatísticas do portfólio
 */
export function usePortfolioStats() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['portfolio-stats'],
    queryFn: async () => {
      // Contar artworks
      const { count: artworksCount, error: artworksError } = await supabase
        .from(TABLES.ARTWORKS)
        .select('*', { count: 'exact', head: true })

      if (artworksError) throw artworksError

      // Contar featured artworks
      const { count: featuredCount, error: featuredError } = await supabase
        .from(TABLES.ARTWORKS)
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true)

      if (featuredError) throw featuredError

      // Contar 1/1 artworks
      const { count: oneOfOneCount, error: oneOfOneError } = await supabase
        .from(TABLES.ARTWORKS)
        .select('*', { count: 'exact', head: true })
        .eq('is_one_of_one', true)

      if (oneOfOneError) throw oneOfOneError

      // Contar séries
      const { count: seriesCount, error: seriesError } = await supabase
        .from(TABLES.SERIES)
        .select('*', { count: 'exact', head: true })

      if (seriesError) throw seriesError

      // Contar artifacts
      const { count: artifactsCount, error: artifactsError } = await supabase
        .from(TABLES.ARTIFACTS)
        .select('*', { count: 'exact', head: true })

      if (artifactsError) throw artifactsError

      return {
        totalArtworks: artworksCount || 0,
        featuredArtworks: featuredCount || 0,
        oneOfOneArtworks: oneOfOneCount || 0,
        totalSeries: seriesCount || 0,
        totalArtifacts: artifactsCount || 0
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (dados estatísticos)
    cacheTime: 15 * 60 * 1000 // 15 minutos
  })
}

/**
 * Hook para obter anos disponíveis (para filtros)
 */
export function useAvailableYears() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['available-years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.ARTWORKS)
        .select('posted_at')
        .not('posted_at', 'is', null)
        .order('posted_at', { ascending: false })

      if (error) throw error

      const years = [
        ...new Set(
          data?.map((item) => new Date(item.posted_at!).getFullYear()) || []
        )
      ].sort((a, b) => b - a) // Ordem decrescente

      return years
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
    cacheTime: 60 * 60 * 1000 // 1 hora
  })
}

/**
 * Hook para obter tipos de artwork disponíveis (para filtros)
 */
export function useAvailableTypes() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['available-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.ARTWORKS)
        .select('type')
        .not('type', 'is', null)

      if (error) throw error

      const types = [...new Set(data?.map((item) => item.type) || [])].sort()

      return types
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
    cacheTime: 60 * 60 * 1000 // 1 hora
  })
}
