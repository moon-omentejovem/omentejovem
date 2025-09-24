/**
 * Helper de Compatibilidade para Migração de Imagens
 *
 * Fornece funções auxiliares para facilitar a migração gradual
 * da estrutura de imagens de slug-based para id-based.
 */

import { getImageUrlFromId, getImageUrlFromSlugCompat } from '@/utils/storage'

/**
 * Helper para gerar URL de imagem com fallback
 */
export function getImageUrlWithFallback(
  item: { id?: string; slug?: string; filename?: string },
  resourceType: string = 'artworks',
  imageType: 'optimized' | 'raw' = 'optimized'
): string {
  // Tentar nova estrutura primeiro
  if (item.id && item.filename) {
    return getImageUrlFromId(item.id, item.filename, resourceType, imageType)
  }

  // Fallback para estrutura antiga
  if (item.slug) {
    return getImageUrlFromSlugCompat(item.slug, resourceType, imageType)
  }

  return ''
}

/**
 * Helper para processar lista de artworks
 */
export function processArtworksForDisplay(artworks: any[]) {
  return artworks.map(artwork => ({
    ...artwork,
    imageUrl: getImageUrlWithFallback(artwork, 'artworks', 'optimized'),
    detailedImageUrl: getImageUrlWithFallback(artwork, 'artworks', 'raw')
  }))
}

/**
 * Helper para processar lista de séries
 */
export function processSeriesForDisplay(series: any[]) {
  return series.map(serie => ({
    ...serie,
    imageUrl: getImageUrlWithFallback(serie, 'series', 'optimized'),
    detailedImageUrl: getImageUrlWithFallback(serie, 'series', 'raw')
  }))
}

/**
 * Helper para processar lista de artifacts
 */
export function processArtifactsForDisplay(artifacts: any[]) {
  return artifacts.map(artifact => ({
    ...artifact,
    imageUrl: getImageUrlWithFallback(artifact, 'artifacts', 'optimized'),
    detailedImageUrl: getImageUrlWithFallback(artifact, 'artifacts', 'raw')
  }))
}
