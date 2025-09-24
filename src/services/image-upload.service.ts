/**
 * Simplified Image Upload Service - Omentejovem
 *
 * Novo serviço simplificado que usa slug-based paths para organizar imagens
 * no Supabase Storage sem necessidade de salvar paths no banco de dados
 */

import { STORAGE_BUCKETS } from '@/lib/supabase/config'
import { optimizeImageFile } from '@/utils/optimize-image'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface ImageUploadResult {
  success: boolean
  slug: string
  optimizedPath: string
  rawPath: string
}

export class ImageUploadService {
  /**
   * Gera slug limpo a partir de um título ou nome de arquivo
   */
  private static generateSlug(input: string): string {
    if (!input || typeof input !== 'string') return ''
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-|-$/g, '') // Remove hífens do início e fim
  }

  /**
   * Gera paths baseados em slug para diferentes tipos de recurso
   */
  private static generatePaths(
    slug: string,
    filename: string,
    resourceType: string = 'artworks',
    type?: string
  ): { optimizedPath: string; rawPath: string } {
    // Remove espaços e normaliza nome
    const cleanFilename = filename.replace(/\s+/g, '-').toLowerCase()
    // Se type for fornecido, inclui na pasta
    const typeSegment = type ? `/${type}` : ''
    return {
      optimizedPath: `${resourceType}/${slug}${typeSegment}/optimized/${cleanFilename.replace(/\.(webp|jpg|jpeg|png)$/i, '')}.webp`,
      rawPath: `${resourceType}/${slug}${typeSegment}/raw/${cleanFilename}`
    }
  }

  /**
   * Upload simplificado baseado em slug
   * @param file - Arquivo de imagem a ser enviado
   * @param slug - Slug único que será usado para nomear os arquivos
   * @param supabase - Cliente Supabase
   * @param resourceType - Tipo de recurso (artworks, series, artifacts)
   * @returns Resultado do upload com paths gerados
   */
  static async uploadImageBySlug(
    file: File,
    slug: string,
    supabase: SupabaseClient,
    resourceType: string = 'artworks'
  ): Promise<ImageUploadResult> {
    const cleanSlug = this.generateSlug(slug)
    const bucket = STORAGE_BUCKETS.MEDIA
    // Para artworks, series, artifacts, pode passar type
    const type = ['artworks', 'series', 'artifacts'].includes(resourceType)
      ? resourceType
      : undefined
    const { optimizedPath, rawPath } = this.generatePaths(
      cleanSlug,
      file.name,
      resourceType,
      type
    )

    try {
      // 1. Upload do arquivo original como raw
      const { error: rawError } = await supabase.storage
        .from(bucket)
        .upload(rawPath, file, {
          contentType: file.type,
          upsert: true // Permite sobrescrever arquivo existente
        })

      if (rawError) {
        throw new Error(`Failed to upload raw image: ${rawError.message}`)
      }

      // 2. Se não for editor, otimizar e fazer upload da versão otimizada
      if (resourceType !== 'editor') {
        const optimized = await optimizeImageFile(file)

        const { error: optError } = await supabase.storage
          .from(bucket)
          .upload(optimizedPath, optimized, {
            contentType: 'image/webp',
            upsert: true // Permite sobrescrever arquivo existente
          })

        if (optError) {
          throw new Error(
            `Failed to upload optimized image: ${optError.message}`
          )
        }
      }

      return {
        success: true,
        slug: cleanSlug,
        optimizedPath: resourceType !== 'editor' ? optimizedPath : '',
        rawPath
      }
    } catch (error) {
      // Limpar uploads parciais em caso de erro
      await this.cleanupFailedUpload(supabase, bucket, rawPath, optimizedPath)
      throw error
    }
  }

  /**
   * Upload com validação automática - compatibilidade com sistema antigo
   * @deprecated Use uploadImageBySlug instead
   */
  // ...existing code...

  /**
   * Limpa uploads que falharam parcialmente
   */
  private static async cleanupFailedUpload(
    supabase: SupabaseClient,
    bucket: string,
    rawPath: string,
    optimizedPath: string
  ): Promise<void> {
    try {
      await Promise.allSettled([
        supabase.storage.from(bucket).remove([rawPath]),
        supabase.storage.from(bucket).remove([optimizedPath])
      ])
    } catch (cleanupError) {
      console.warn('Failed to cleanup partial upload:', cleanupError)
    }
  }

  /**
   * Valida se o arquivo é uma imagem válida
   */
  static validateImageFile(file: File): void {
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ]

    if (!validTypes.includes(file.type)) {
      throw new Error(
        `Invalid file type: ${file.type}. Supported: ${validTypes.join(', ')}`
      )
    }

    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      throw new Error(
        `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max size: 50MB`
      )
    }
  }

  /**
   * Gera URL pública a partir de um slug (helper function)
   */
  static getPublicUrl(
    slug: string,
    resourceType: string = 'artworks',
    imageType: 'optimized' | 'raw' = 'optimized'
  ): string {
    const { optimizedPath, rawPath } = this.generatePaths(slug, resourceType)
    const path = imageType === 'raw' ? rawPath : optimizedPath

    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKETS.MEDIA}/${path}`
  }

  /**
   * Remove imagens baseado no slug
   */
  static async removeImagesBySlug(
    slug: string,
    supabase: SupabaseClient,
    resourceType: string = 'artworks'
  ): Promise<void> {
    const { optimizedPath, rawPath } = this.generatePaths(slug, resourceType)
    const bucket = STORAGE_BUCKETS.MEDIA

    try {
      await Promise.allSettled([
        supabase.storage.from(bucket).remove([rawPath]),
        supabase.storage.from(bucket).remove([optimizedPath])
      ])
    } catch (error) {
      console.warn(`Failed to remove images for slug ${slug}:`, error)
    }
  }
}
