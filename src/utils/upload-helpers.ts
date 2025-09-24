/**
 * Helper de Upload para Nova Estrutura de Imagens
 *
 * Facilita o upload de imagens usando a nova estrutura
 * {scaffold}/{id}/{compression}/{filename}.{ext}
 */

import { ImageUploadService } from '@/services/image-upload.service'
import { createClient } from '@/utils/supabase/client'

export interface UploadOptions {
  resourceType: string // agora aceita qualquer scaffold, ex: 'editor', 'artworks', etc
  id: string
  filename: string
}

export interface UploadResult {
  success: boolean
  id?: string
  optimizedPath?: string
  rawPath?: string
  error?: string
}

/**
 * Helper para upload de imagem
 */
export async function uploadImage(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    const supabase = createClient()

    const result = await ImageUploadService.uploadImageBySlug(
      file,
      options.id,
      supabase,
      options.resourceType
    )

    return {
      success: result.success,
      id: result.slug,
      optimizedPath: result.optimizedPath,
      rawPath: result.rawPath
    }
  } catch (error) {
    console.error('Erro no upload:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

/**
 * Helper para upload de artwork
 */
// ...existing code...

/**
 * Helper para gerar filename baseado no título
 */
export function generateFilename(
  title: string,
  extension: string = 'webp'
): string {
  return (
    title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // Remove acentos
      .replace(/[^a-z0-9s-]/g, '') // Remove caracteres especiais
      .replace(/s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-|-$/g, '') + // Remove hífens do início e fim
    '.' +
    extension
  )
}

/**
 * Helper para validar arquivo de imagem
 */
export function validateImageFile(file: File): {
  valid: boolean
  error?: string
} {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
  const maxSize = 50 * 1024 * 1024 // 50MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo inválido: ${file.type}. Tipos aceitos: ${validTypes.join(', ')}`
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Tamanho máximo: 50MB`
    }
  }

  return { valid: true }
}
