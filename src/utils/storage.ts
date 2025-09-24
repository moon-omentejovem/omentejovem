/**
 * Storage Utils - Omentejovem
 * Utilitários para trabalhar com o sistema de imagens
 * Suporta tanto estrutura antiga (slug-based) quanto nova (id-based)
 */

import { STORAGE_BUCKETS } from '@/lib/supabase/config'
import { createClient } from '@/utils/supabase/client'

/**
 * Gera path da imagem baseado no slug (estrutura antiga)
 */
function generateImagePath(
  slug: string,
  resourceType: string = 'artworks',
  imageType: 'optimized' | 'raw' = 'optimized'
): string {
  if (imageType === 'raw') {
    return `${resourceType}/raw/${slug}-raw.jpg`
  }
  return `${resourceType}/optimized/${slug}.webp`
}

/**
 * Gera path da imagem baseado no ID (nova estrutura)
 */
function generateImagePathById(
  id: string,
  filename: string,
  resourceType: string = 'artworks',
  imageType: 'optimized' | 'raw' = 'optimized'
): string {
  const baseName = filename.replace(/\.(webp|jpg|jpeg|png)$/i, '')

  if (imageType === 'raw') {
    return `${resourceType}/${id}/raw/${baseName}.jpg`
  }
  return `${resourceType}/${id}/optimized/${baseName}.webp`
}

/**
 * Gera URL pública a partir de um slug (estrutura antiga)
 * Por padrão retorna a imagem otimizada (optimized). Para obter a raw, passe imageType='raw'.
 * Use imageType='raw' apenas para casos especiais (ex: modal de página única).
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
    const { data } = supabase.storage
      .from(STORAGE_BUCKETS.MEDIA)
      .getPublicUrl(path)
    return data.publicUrl || ''
  } catch (error) {
    console.error(
      `getImageUrlFromSlug: Error generating URL for slug: ${slug}`,
      error
    )
    return ''
  }
}

/**
 * Gera URL pública a partir de um ID e filename (nova estrutura)
 * Por padrão retorna a imagem otimizada (optimized). Para obter a raw, passe imageType='raw'.
 */
export function getImageUrlFromId(
  id: string | null,
  filename: string | null,
  resourceType: string = 'artworks',
  imageType: 'optimized' | 'raw' = 'optimized'
): string {
  if (!id || !filename) return ''

  try {
    const supabase = createClient()
    const path = generateImagePathById(id, filename, resourceType, imageType)
    const { data } = supabase.storage
      .from(STORAGE_BUCKETS.MEDIA)
      .getPublicUrl(path)
    return data.publicUrl || ''
  } catch (error) {
    console.error(
      `getImageUrlFromId: Error generating URL for id: ${id}, filename: ${filename}`,
      error
    )
    return ''
  }
}

/**
 * Função de compatibilidade para migração gradual
 * Tenta usar nova estrutura primeiro, fallback para antiga
 */
export function getImageUrlFromSlugCompat(
  slug: string | null,
  resourceType: string = 'artworks',
  imageType: 'optimized' | 'raw' = 'optimized'
): string {
  // Por enquanto, usa a estrutura antiga
  // Esta função será atualizada quando a migração estiver completa
  return getImageUrlFromSlug(slug, resourceType, imageType)
}
export function getArtifactImageUrl(
  artifact: any,
  imageType: 'optimized' | 'raw' = 'optimized'
) {
  return getImageUrlFromSlugCompat(artifact.id, 'artifacts', imageType)
}
