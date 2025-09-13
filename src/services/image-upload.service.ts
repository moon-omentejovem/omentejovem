/**
 * Image Upload Service - Omentejovem
 *
 * Serviço responsável por fazer upload e otimização de imagens
 * para o Supabase Storage, seguindo a arquitetura de pastas raw/ e optimized/
 */

import { STORAGE_BUCKETS, STORAGE_FOLDERS } from '@/lib/supabase/config'
import { optimizeImageFile } from '@/utils/optimize-image'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface ImageUploadResult {
  optimizedPath: string
  rawPath: string
}

export class ImageUploadService {
  /**
   * Faz upload de uma imagem com otimização automática
   * @param file - Arquivo de imagem a ser enviado
   * @param supabase - Cliente Supabase
   * @param resourceType - Tipo de recurso (artworks, series, artifacts, etc.)
   * @returns Paths da imagem otimizada e original no storage
   */
  static async uploadImage(
    file: File,
    supabase: SupabaseClient,
    resourceType: string = 'artworks'
  ): Promise<ImageUploadResult> {
    const timestamp = Date.now()
    const baseName = file.name.replace(/\.[^/.]+$/, '')
    const bucket = STORAGE_BUCKETS.MEDIA

    // Paths para raw e otimizada
    const rawPath = `${resourceType}/${STORAGE_FOLDERS.RAW}/${timestamp}-${file.name}`
    const optimizedPath = `${resourceType}/${STORAGE_FOLDERS.OPTIMIZED}/${timestamp}-${baseName}.webp`

    try {
      // 1. Upload do arquivo original
      const { error: rawError } = await supabase.storage
        .from(bucket)
        .upload(rawPath, file, { contentType: file.type })

      if (rawError) {
        throw new Error(`Failed to upload raw image: ${rawError.message}`)
      }

      // 2. Otimizar imagem
      const optimized = await optimizeImageFile(file)

      // 3. Upload da imagem otimizada
      const { error: optError } = await supabase.storage
        .from(bucket)
        .upload(optimizedPath, optimized, {
          contentType: 'image/webp'
        })

      if (optError) {
        throw new Error(`Failed to upload optimized image: ${optError.message}`)
      }

      // 4. Retornar paths para salvar no banco
      return {
        optimizedPath,
        rawPath
      }
    } catch (error) {
      // Limpar uploads parciais em caso de erro
      await this.cleanupFailedUpload(supabase, bucket, rawPath, optimizedPath)
      throw error
    }
  }

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
      // Tentar remover ambos os arquivos (pode ser que um tenha sido enviado)
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
        `Invalid file type: ${file.type}. Only images are allowed.`
      )
    }

    // Limite de 10MB
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error(
        `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 10MB.`
      )
    }
  }

  /**
   * Upload com validação automática
   */
  static async uploadImageWithValidation(
    file: File,
    supabase: SupabaseClient,
    resourceType: string = 'artworks'
  ): Promise<ImageUploadResult> {
    // Validar arquivo antes do upload
    this.validateImageFile(file)

    // Fazer upload
    return await this.uploadImage(file, supabase, resourceType)
  }
}
