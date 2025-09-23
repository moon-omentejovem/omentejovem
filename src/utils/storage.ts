/**
 * Simplified Storage Utils - Omentejovem
 * Utilitários para trabalhar com o novo sistema de imagens baseado em slug
 */

import { STORAGE_BUCKETS } from '@/lib/supabase/config'
import { createClient } from '@/utils/supabase/client'

/**
 * Gera path da imagem baseado no slug
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
/**
 * Gera URL pública a partir de um slug
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
export function getArtifactImageUrl(
  artifact: any,
  imageType: 'optimized' | 'raw' = 'optimized'
) {
  return getImageUrlFromSlug(artifact.id, 'artifacts', imageType)
}
