/**
 * Storage Utils - Omentejovem
 * Utilitários simplificados para trabalhar com Supabase Storage
 */

import { createClient } from '@/utils/supabase/client'

/**
 * Gera URL pública a partir de um path do storage
 * Usado apenas no contexto admin onde paths precisam ser convertidos dinamicamente
 */
export function getPublicUrl(path: string | null): string | null {
  if (!path) return null

  // Se já é uma URL completa, retornar como está
  if (path.startsWith('http')) {
    return path
  }

  // Gerar URL pública do storage
  const supabase = createClient()
  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return data.publicUrl
}

/**
 * Extrai URLs de imagem de um artwork
 * SIMPLIFICADO: Agora apenas retorna as URLs que já vêm processadas do backend
 */
export function getArtworkImageUrls(artwork: any) {
  return {
    optimized: artwork.image_url,
    raw: artwork.raw_image_url
  }
}
