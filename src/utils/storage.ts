import { STORAGE_BUCKETS } from '@/lib/supabase/config'
import { createClient } from '@/utils/supabase/client'

/**
 * Gera URL pública a partir de id e filename (padrão centralizado)
 * @param id - identificador único do recurso
 * @param filename - nome do arquivo (ex: slug ou nome original)
 * @param resourceType - tipo do recurso (artworks, series, artifacts, editor)
 * @param imageType - 'optimized' | 'raw'
 */
export function getImageUrlFromId(
  id: string | null,
  filename: string | null,
  resourceType: string = 'artworks',
  imageType: 'optimized' | 'raw' = 'optimized'
): string {
  if (!id || !filename) return ''

  // Gera path conforme padrão único
  const cleanFilename = filename.replace(/\s+/g, '-').toLowerCase()
  let path = ''
  // Para artworks, series, artifacts, inclui type
  const type = ['artworks', 'series', 'artifacts'].includes(resourceType)
    ? resourceType
    : undefined
  const typeSegment = type ? `/${type}` : ''
  if (resourceType === 'editor') {
    path = `editor/${id}/raw/${cleanFilename}`
  } else {
    path =
      imageType === 'raw'
        ? `${resourceType}/${id}${typeSegment}/raw/${cleanFilename}`
        : `${resourceType}/${id}${typeSegment}/optimized/${cleanFilename.replace(/\.(webp|jpg|jpeg|png)$/i, '')}.webp`
  }

  try {
    const supabase = createClient()
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
 * Storage Utils - Omentejovem
 * Utilitários para trabalhar com o sistema de imagens
 * Suporta tanto estrutura antiga (slug-based) quanto nova (id-based)
 */

/**
 * Gera path da imagem baseado no slug (estrutura antiga)
 */
// ...existing code...
