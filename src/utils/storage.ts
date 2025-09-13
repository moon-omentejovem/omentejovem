/**
 * Storage Utils - Omentejovem
 * Utilitários simplificados para trabalhar com Supabase Storage
 */

import { createClient } from '@/utils/supabase/client'

/**
 * Gera URL pública a partir de um path do storage
 */
export function getPublicUrl(path: string | null): string | null {
  if (!path) return null

  const supabase = createClient()
  const { data } = supabase.storage.from('media').getPublicUrl(path)

  return data.publicUrl
}

/**
 * Gera URLs para imagem otimizada e original com suporte a campos legados
 */
export function getArtworkImageUrls(artwork: any) {
  // Priorizar campos de path, fallback para URL
  const imagePath = artwork.image_path || artwork.image_url
  const rawImagePath = artwork.raw_image_path || artwork.raw_image_url

  return {
    optimized: getPublicUrl(imagePath),
    raw: getPublicUrl(rawImagePath)
  }
}
