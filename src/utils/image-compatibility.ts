/**
 * Camada de Compatibilidade - Migração de Estrutura de Imagens
 *
 * Este arquivo fornece funções de compatibilidade durante a migração
 * da estrutura de imagens de slug-based para id-based.
 */

import { createClient } from '@/utils/supabase/client'
import { STORAGE_BUCKETS } from '@/lib/supabase/config'

// Cache para mapeamento slug -> id
const slugToIdCache = new Map<string, string>()

/**
 * Busca ID pelo slug (com cache)
 */
async function getIdBySlug(slug: string, resourceType: string): Promise<string | null> {
  const cacheKey = `${resourceType}:${slug}`

  if (slugToIdCache.has(cacheKey)) {
    return slugToIdCache.get(cacheKey) || null
  }

  try {
    const supabase = createClient()
    let query

    switch (resourceType) {
      case 'artworks':
        query = supabase.from('artworks').select('id').eq('slug', slug).single()
        break
      case 'series':
        query = supabase.from('series').select('id').eq('slug', slug).single()
        break
      case 'artifacts':
        query = supabase.from('artifacts').select('id').eq('title', slug).single()
        break
      default:
        return null
    }

    const { data, error } = await query

    if (error || !data) {
      console.warn(`ID não encontrado para ${resourceType} slug: ${slug}`)
      return null
    }

    slugToIdCache.set(cacheKey, data.id)
    return data.id

  } catch (error) {
    console.error(`Erro ao buscar ID para slug ${slug}:`, error)
    return null
  }
}

/**
 * Função de compatibilidade que converte slug para ID
 */
export async function getImageUrlFromSlugCompat(
  slug: string | null,
  resourceType: string = 'artworks',
  imageType: 'optimized' | 'raw' = 'optimized'
): Promise<string> {
  if (!slug) return ''

  const id = await getIdBySlug(slug, resourceType)
  if (!id) return ''

  // Gerar filename baseado no slug (assumindo .webp para optimized, .jpg para raw)
  const extension = imageType === 'raw' ? 'jpg' : 'webp'
  const filename = `${slug}.${extension}`

  // Usar nova estrutura
  const path = `${resourceType}/${id}/${imageType}/${filename}`

  try {
    const supabase = createClient()
    const { data } = supabase.storage
      .from(STORAGE_BUCKETS.MEDIA)
      .getPublicUrl(path)
    return data.publicUrl || ''
  } catch (error) {
    console.error(`Erro ao gerar URL para ${path}:`, error)
    return ''
  }
}

/**
 * Limpar cache de mapeamento
 */
export function clearSlugToIdCache() {
  slugToIdCache.clear()
}
