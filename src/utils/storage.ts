/**
 * Storage Utils - Omentejovem
 *
 * Utilitários para trabalhar com storage paths e URLs públicas do Supabase
 */

import { STORAGE_BUCKETS } from '@/lib/supabase/config'
import { createClient } from '@/utils/supabase/client'

/**
 * Gera URL pública a partir de um path do storage
 * @param path - Path do arquivo no storage (ex: "artworks/optimized/123-image.webp")
 * @param bucket - Bucket do storage (padrão: 'media')
 * @returns URL pública do arquivo
 */
export function getPublicUrl(
  path: string | null,
  bucket: string = STORAGE_BUCKETS.MEDIA
): string | null {
  if (!path) return null

  const supabase = createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}

/**
 * Gera URLs para imagem otimizada e original com suporte a campos legados
 * @param artwork - Objeto artwork que pode ter campos antigos ou novos
 * @returns Objeto com URLs das imagens
 */
export function getArtworkImageUrls(artwork: any) {
  // Priorizar campos novos, fallback para antigos
  const imagePath = artwork.image_path || artwork.image_url
  const rawImagePath = artwork.raw_image_path || artwork.raw_image_url

  return getImageUrls(imagePath, rawImagePath)
}

/**
 * Gera URLs para imagem otimizada e original
 * @param imagePath - Path da imagem otimizada
 * @param rawImagePath - Path da imagem original
 * @returns Objeto com URLs das imagens
 */
export function getImageUrls(
  imagePath: string | null,
  rawImagePath: string | null
) {
  return {
    optimizedUrl: getPublicUrl(imagePath),
    rawUrl: getPublicUrl(rawImagePath)
  }
}

/**
 * Extrai informações do path de uma imagem
 * @param path - Path completo (ex: "artworks/optimized/123-image.webp")
 * @returns Informações extraídas do path
 */
export function parseImagePath(path: string) {
  const parts = path.split('/')
  const fileName = parts[parts.length - 1]
  const folder = parts[parts.length - 2] // 'optimized' ou 'raw'
  const resourceType = parts[0] // 'artworks', 'series', etc.

  return {
    fileName,
    folder,
    resourceType,
    isOptimized: folder === 'optimized',
    isRaw: folder === 'raw'
  }
}

/**
 * Gera path completo para storage a partir de parâmetros
 * @param resourceType - Tipo de recurso (artworks, series, etc.)
 * @param folder - Pasta (optimized ou raw)
 * @param fileName - Nome do arquivo
 * @returns Path completo
 */
export function buildStoragePath(
  resourceType: string,
  folder: 'optimized' | 'raw',
  fileName: string
): string {
  return `${resourceType}/${folder}/${fileName}`
}

/**
 * Hook para usar em componentes React
 * Converte automaticamente paths para URLs quando o path mudar
 */
export function useImageUrl(imagePath: string | null, bucket?: string) {
  if (!imagePath) return null
  return getPublicUrl(imagePath, bucket)
}

/**
 * Verifica se uma string é um path do storage ou uma URL externa
 * @param value - String a ser verificada
 * @returns true se for um path do storage
 */
export function isStoragePath(value: string): boolean {
  // Paths do storage não começam com http:// ou https://
  return !value.startsWith('http://') && !value.startsWith('https://')
}

/**
 * Converte URL do Supabase Storage para path
 * @param url - URL pública do Supabase Storage
 * @returns Path extraído da URL ou null se não for URL do Supabase
 */
export function extractPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)

    // Verifica se é URL do Supabase Storage
    if (!urlObj.hostname.includes('supabase')) {
      return null
    }

    // Extrai o path após /storage/v1/object/public/[bucket]/
    const pathMatch = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
    return pathMatch ? pathMatch[1] : null
  } catch {
    return null
  }
}
