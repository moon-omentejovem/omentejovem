/**
 * Image Upload Service - Omentejovem
 *
 * Centraliza o upload de imagens seguindo o novo padrão baseado em ID:
 * {scaffold}/{id}/[raw|optimized]/{filename}.{ext}
 */

import { STORAGE_BUCKETS } from '@/lib/supabase/config'
import {
  GenerateImagePathOptions,
  generateImagePaths
} from '@/utils/image-path'
import { optimizeImageFile } from '@/utils/optimize-image'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface ImageUploadResult {
  success: boolean
  identifier: string
  filename: string
  rawPath: string
  optimizedPath: string | null
}

export interface ImageUploadOptions extends GenerateImagePathOptions {}

export class ImageUploadService {
  /**
   * Upload baseado em ID (nova estrutura)
   * @param file - Arquivo de imagem a ser enviado
   * @param id - Identificador único do recurso (UUID, slug, etc)
   * @param filename - Nome do arquivo (com ou sem extensão)
   * @param supabase - Cliente Supabase
   * @param resourceType - Tipo de recurso (artworks, series, artifacts, editor)
   */
  static async uploadImageById(
    file: File,
    id: string,
    filename: string,
    supabase: SupabaseClient,
    resourceType: string = 'artworks',
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult> {
    const bucket = STORAGE_BUCKETS.MEDIA
    const includeOptimized =
      options.includeOptimized ?? resourceType !== 'editor'
    const { rawPath, optimizedPath, rawFilename } = generateImagePaths(
      resourceType,
      id,
      filename,
      { includeOptimized }
    )

    try {
      const { error: rawError } = await supabase.storage
        .from(bucket)
        .upload(rawPath, file, {
          contentType: file.type,
          upsert: true
        })

      if (rawError) {
        throw new Error(`Failed to upload raw image: ${rawError.message}`)
      }

      if (includeOptimized && optimizedPath) {
        const optimized = await optimizeImageFile(file)

        const { error: optError } = await supabase.storage
          .from(bucket)
          .upload(optimizedPath, optimized, {
            contentType: 'image/webp',
            upsert: true
          })

        if (optError) {
          throw new Error(`Failed to upload optimized image: ${optError.message}`)
        }
      }

      return {
        success: true,
        identifier: id,
        filename: rawFilename,
        rawPath,
        optimizedPath: optimizedPath ?? null
      }
    } catch (error) {
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
    optimizedPath: string | null
  ): Promise<void> {
    const pathsToRemove = [rawPath]
    if (optimizedPath) {
      pathsToRemove.push(optimizedPath)
    }

    try {
      await Promise.allSettled([
        supabase.storage.from(bucket).remove(pathsToRemove)
      ])
    } catch (cleanupError) {
      console.warn('Failed to cleanup partial upload:', cleanupError)
    }
  }

  /**
   * Remove imagens baseado em ID
   */
  static async removeImagesById(
    id: string,
    supabase: SupabaseClient,
    resourceType: string = 'artworks',
    filename: string,
    options: ImageUploadOptions = {}
  ): Promise<void> {
    const bucket = STORAGE_BUCKETS.MEDIA
    const includeOptimized =
      options.includeOptimized ?? resourceType !== 'editor'
    const { rawPath, optimizedPath } = generateImagePaths(
      resourceType,
      id,
      filename,
      { includeOptimized }
    )

    const paths = [rawPath]
    if (includeOptimized && optimizedPath) {
      paths.push(optimizedPath)
    }

    try {
      await supabase.storage.from(bucket).remove(paths)
    } catch (error) {
      console.warn(`Failed to remove images for id ${id}:`, error)
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
}
