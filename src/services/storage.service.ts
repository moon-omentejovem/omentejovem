/**
 * Storage Service - Omentejovem
 *
 * Serviço responsável por gerenciar URLs de imagens no Supabase Storage
 * seguindo a arquitetura de pastas raw/ e optimized/
 */

import { BaseService } from './base.service'

export class StorageService extends BaseService {
  private static readonly BUCKET_NAME = 'media'
  private static readonly RAW_FOLDER = 'raw'
  private static readonly OPTIMIZED_FOLDER = 'optimized'

  // NOVO PADRÃO: use helpers baseados em slug/id (getImageUrlFromSlug, etc)

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
