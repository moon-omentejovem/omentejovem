import { createClient } from '@/utils/supabase/client'

/**
 * Gera URL pública do Supabase Storage
 * Para uso com Next.js Image que fará as otimizações
 */
export function getSupabaseImageUrl(path: string): string {
  if (!path) return ''

  // Se já é uma URL completa, retorna ela
  if (path.startsWith('http')) return path

  const supabase = createClient()

  // Remove barra inicial se existir
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  // Gera URL pública
  const { data } = supabase.storage.from('media').getPublicUrl(cleanPath)

  return data.publicUrl
}
