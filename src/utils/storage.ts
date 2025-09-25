import { STORAGE_BUCKETS } from '@/lib/supabase/config'
import { createClient } from '@/utils/supabase/client'
import { generateImagePaths } from './image-path'

/**
 * Gera URL pública a partir de id e filename (padrão centralizado)
 * @param id - identificador único do recurso
 * @param filename - nome do arquivo (com ou sem extensão)
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

  const { rawPath, optimizedPath } = generateImagePaths(
    resourceType,
    id,
    filename
  )

  const path = imageType === 'raw' || !optimizedPath ? rawPath : optimizedPath

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
