/**
 * Storage Utils - Omentejovem
 * Utilitários simplificados para trabalhar com Supabase Storage
 */

import { createClient } from '@/utils/supabase/client'

/**
 * Gera URL pública a partir de um path do storage
 * Sempre retorna URL direta do Supabase para garantir consistência e SSR
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
 * Gera URLs para imagem otimizada e original com suporte a campos legados
 * IMPORTANTE: Para o front-end público, as URLs já são processadas no servidor
 * via ArtworkService, então esta função apenas extrai os valores corretos
 */
export function getArtworkImageUrls(artwork: any) {
  return {
    // URLs já processadas pelo servidor para front-end público
    // Fallback para paths se URLs não estiverem disponíveis (admin)
    optimized: artwork.image_url || getPublicUrl(artwork.image_path),
    raw: artwork.raw_image_url || getPublicUrl(artwork.raw_image_path)
  }
}
