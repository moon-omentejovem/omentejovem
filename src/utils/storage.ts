/**
 * Simplified Storage Utils - Omentejovem
 * Utilitários para trabalhar com o novo sistema de imagens baseado em slug
 */

import { createClient } from '@/utils/supabase/client'
import { STORAGE_BUCKETS } from '@/lib/supabase/config'

/**
 * Gera path da imagem baseado no slug
 */
function generateImagePath(slug: string, resourceType: string = 'artworks', imageType: 'optimized' | 'raw' = 'optimized'): string {
  if (imageType === 'raw') {
    return `${resourceType}/raw/${slug}-raw.jpg`
  }
  return `${resourceType}/optimized/${slug}.webp`
}

/**
 * Gera URL pública a partir de um slug
 * Nova implementação que usa paths baseados em slug
 */
export function getImageUrlFromSlug(
  slug: string | null, 
  resourceType: string = 'artworks', 
  imageType: 'optimized' | 'raw' = 'optimized'
): string {
  if (!slug) return ''

  try {
    const supabase = createClient()
    const path = generateImagePath(slug, resourceType, imageType)
    const { data } = supabase.storage.from(STORAGE_BUCKETS.MEDIA).getPublicUrl(path)

    return data.publicUrl || ''
  } catch (error) {
    console.error(`getImageUrlFromSlug: Error generating URL for slug: ${slug}`, error)
    return ''
  }
}

/**
 * Gera URL pública a partir de um path (compatibilidade com sistema antigo)
 * @deprecated Use getImageUrlFromSlug instead
 */
export function getPublicUrl(path: string | null): string {
  if (!path) return ''

  // Se já é uma URL completa, retornar como está
  if (path.startsWith('http')) {
    return path
  }

  try {
    const supabase = createClient()
    const { data } = supabase.storage.from(STORAGE_BUCKETS.MEDIA).getPublicUrl(path)

    if (data.publicUrl && data.publicUrl.startsWith('http')) {
      return data.publicUrl
    } else {
      console.warn(`getPublicUrl: Invalid URL generated for path: ${path}`)
      return ''
    }
  } catch (error) {
    console.error(`getPublicUrl: Error generating URL for path: ${path}`, error)
    return ''
  }
}

/**
 * Extrai URLs de imagem de um artwork usando o novo sistema baseado em slug
 */
export function getArtworkImageUrls(artwork: any) {
  if (artwork.slug) {
    // Novo sistema: gerar URLs a partir do slug
    return {
      optimized: getImageUrlFromSlug(artwork.slug, 'artworks', 'optimized'),
      raw: getImageUrlFromSlug(artwork.slug, 'artworks', 'raw')
    }
  }

  // Fallback para sistema antigo (durante transição)
  return {
    optimized: artwork.image_url || getPublicUrl(artwork.image_path),
    raw: artwork.raw_image_url || getPublicUrl(artwork.raw_image_path)
  }
}

/**
 * Extrai URL de imagem de uma série usando o novo sistema baseado em slug
 */
export function getSeriesImageUrl(series: any, imageType: 'optimized' | 'raw' = 'optimized') {
  if (series.slug) {
    return getImageUrlFromSlug(series.slug, 'series', imageType)
  }

  // Fallback para sistema antigo
  return series.cover_image_url || getPublicUrl(series.cover_image_path) || ''
}

/**
 * Extrai URL de imagem de um artifact usando ID
 */
export function getArtifactImageUrl(artifact: any, imageType: 'optimized' | 'raw' = 'optimized') {
  if (artifact.id) {
    return getImageUrlFromSlug(artifact.id, 'artifacts', imageType)
  }

  // Fallback para sistema antigo
  return artifact.image_url || getPublicUrl(artifact.image_path) || ''
}
