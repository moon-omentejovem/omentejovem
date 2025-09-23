/**
 * Storage Service - Omentejovem
 *
 * Serviço responsável por gerenciar URLs de imagens no Supabase Storage
 * seguindo a arquitetura de pastas raw/ e optimized/
 */

import { Artwork } from '@/types/artwork'
import { BaseService } from './base.service'

export class StorageService extends BaseService {
  private static readonly BUCKET_NAME = 'media'
  private static readonly RAW_FOLDER = 'raw'
  private static readonly OPTIMIZED_FOLDER = 'optimized'

  /**
   * Gera URL pública para imagem otimizada
   */
  static async getOptimizedImageUrl(filename: string): Promise<string> {
    return this.executeQuery(async (supabase) => {
      const { data } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(`${this.OPTIMIZED_FOLDER}/${filename}`)

      return data.publicUrl
    }, 'getOptimizedImageUrl')
  }

  /**
   * Gera URL pública para imagem original (raw)
   */
  static async getRawImageUrl(filename: string): Promise<string> {
    return this.executeQuery(async (supabase) => {
      const { data } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(`${this.RAW_FOLDER}/${filename}`)

      return data.publicUrl
    }, 'getRawImageUrl')
  }

  /**
   * Extrai filename da URL existente
   */
  static extractFilenameFromUrl(url: string): string | null {
    if (!url) return null

    // Extrair filename da URL atual
    const urlParts = url.split('/')
    const filename = urlParts[urlParts.length - 1]

    // Remover query parameters se existirem
    return filename.split('?')[0]
  }

  /**
   * Converte URL otimizada para URL raw
   */
  static async convertToRawUrl(optimizedUrl: string): Promise<string | null> {
    const filename = this.extractFilenameFromUrl(optimizedUrl)
    if (!filename) return null

    return await this.getRawImageUrl(filename)
  }

  /**
   * Resolve URLs de imagem para uma artwork
   * Retorna URLs otimizada e raw, com fallbacks apropriados
   */
  static resolveArtworkImageUrls(artwork: Artwork): {
    optimized: string
    raw: string
  } {
    const optimized = artwork.image_url
    const raw = artwork.raw_image_url || artwork.image_url

    return { optimized, raw }
  }

  /**
   * Lista arquivos no bucket (para debug/manutenção)
   */
  static async listFiles(
    folder: 'raw' | 'optimized' = 'raw'
  ): Promise<string[]> {
    return this.executeQuery(async (supabase) => {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(folder)

      if (error) {
        console.error(`Erro ao listar arquivos da pasta ${folder}:`, error)
        return []
      }

      return data?.map((file: any) => file.name) || []
    }, 'listFiles')
  }
}
