/**
 * Server-side functions for fetching data
 * Estas funções podem ser reutilizadas em diferentes Server Components
 */

import { TABLES } from '@/lib/supabase/config'
import { createClient } from '@/utils/supabase/server'
import { shuffle } from '@/utils/arrays'

// Cache these functions using Next.js cache
import { cache } from 'react'

/**
 * Busca artworks no servidor com cache
 */
export const getArtworksServer = cache(
  async (options?: {
    limit?: number
    featured?: boolean
    oneOfOne?: boolean
    orderBy?: string
    ascending?: boolean
    random?: boolean
  }) => {
    const supabase = await createClient()

    let query = supabase
      .from(TABLES.ARTWORKS)
      .select(
        'id, image_url, title, slug, type, is_featured, is_one_of_one, posted_at'
      )

    // Aplicar filtros
    if (options?.featured !== undefined) {
      query = query.eq('is_featured', options.featured)
    }

    if (options?.oneOfOne !== undefined) {
      query = query.eq('is_one_of_one', options.oneOfOne)
    }

    // Aplicar ordenação
    query = query.order(options?.orderBy || 'posted_at', {
      ascending: options?.ascending ?? false
    })

    // Aplicar limite
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar artworks no servidor:', error)
      return []
    }

    const artworks = data || []
    return options?.random ? shuffle(artworks) : artworks
  }
)

/**
 * Busca séries no servidor com cache
 */
export const getSeriesServer = cache(
  async (options?: { limit?: number; includeArtworks?: boolean }) => {
    const supabase = await createClient()

    let selectQuery = '*'
    if (options?.includeArtworks) {
      selectQuery = `
      *,
      series_artworks(
        artworks(id, title, image_url, slug)
      )
    `
    }

    let query = supabase
      .from(TABLES.SERIES)
      .select(selectQuery)
      .order('created_at', { ascending: false })

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar séries no servidor:', error)
      return []
    }

    return data || []
  }
)

/**
 * Busca artwork específico por slug no servidor
 */
export const getArtworkBySlugServer = cache(async (slug: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from(TABLES.ARTWORKS)
    .select(
      `
      *,
      series_artworks(
        series(*)
      )
    `
    )
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Erro ao buscar artwork no servidor:', error)
    return null
  }

  return data
})

/**
 * Busca série específica por slug no servidor
 */
export const getSeriesBySlugServer = cache(async (slug: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from(TABLES.SERIES)
    .select(
      `
      *,
      series_artworks(
        artworks(*)
      )
    `
    )
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Erro ao buscar série no servidor:', error)
    return null
  }

  return data
})

/**
 * Busca artifacts no servidor com cache
 */
export const getArtifactsServer = cache(
  async (options?: { limit?: number }) => {
    const supabase = await createClient()

    let query = supabase
      .from(TABLES.ARTIFACTS)
      .select('*')
      .order('created_at', { ascending: false })

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar artifacts no servidor:', error)
      return []
    }

    return data || []
  }
)

/**
 * Busca conteúdo da página About no servidor
 */
export const getAboutPageServer = cache(async () => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from(TABLES.ABOUT_PAGE)
    .select('*')
    .limit(1)
    .single()

  if (error) {
    console.error('Erro ao buscar página About no servidor:', error)
    return null
  }

  return data
})

/**
 * Função para dados da homepage (otimizada)
 */
export const getHomepageDataServer = cache(async () => {
  // Executar todas as queries em paralelo para melhor performance
  const [featuredArtworks, oneOfOneArtworks, series] = await Promise.all([
    getArtworksServer({ featured: true, limit: 6 }),
    getArtworksServer({ oneOfOne: true, limit: 3 }),
    getSeriesServer({ limit: 10 })
  ])

  return {
    featuredArtworks,
    oneOfOneArtworks,
    series
  }
})

/**
 * Estatísticas do portfólio no servidor
 */
export const getPortfolioStatsServer = cache(async () => {
  const supabase = await createClient()

  // Executar contagens em paralelo
  const [
    { count: totalArtworks },
    { count: featuredArtworks },
    { count: oneOfOneArtworks },
    { count: totalSeries },
    { count: totalArtifacts }
  ] = await Promise.all([
    supabase.from(TABLES.ARTWORKS).select('*', { count: 'exact', head: true }),
    supabase
      .from(TABLES.ARTWORKS)
      .select('*', { count: 'exact', head: true })
      .eq('is_featured', true),
    supabase
      .from(TABLES.ARTWORKS)
      .select('*', { count: 'exact', head: true })
      .eq('is_one_of_one', true),
    supabase.from(TABLES.SERIES).select('*', { count: 'exact', head: true }),
    supabase.from(TABLES.ARTIFACTS).select('*', { count: 'exact', head: true })
  ])

  return {
    totalArtworks: totalArtworks || 0,
    featuredArtworks: featuredArtworks || 0,
    oneOfOneArtworks: oneOfOneArtworks || 0,
    totalSeries: totalSeries || 0,
    totalArtifacts: totalArtifacts || 0
  }
})
