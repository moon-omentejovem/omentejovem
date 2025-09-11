/**
 * React Query hooks for file uploads and storage operations
 */

import { STORAGE_BUCKETS, STORAGE_FOLDERS } from '@/lib/supabase/config'
import { createClient } from '@/utils/supabase/client'
import { useMutation, useQuery } from 'react-query'

export interface UploadOptions {
  bucket?: string
  folder?: string
  fileName?: string
  contentType?: string
  cacheControl?: string
  upsert?: boolean
}

/**
 * Hook para upload de arquivos
 */
export function useUploadFile() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      file,
      options = {}
    }: {
      file: File
      options?: UploadOptions
    }) => {
      const {
        bucket = STORAGE_BUCKETS.MEDIA,
        folder = STORAGE_FOLDERS.RAW,
        fileName = file.name,
        contentType = file.type,
        cacheControl = '3600',
        upsert = false
      } = options

      const filePath = folder ? `${folder}/${fileName}` : fileName

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          contentType,
          cacheControl,
          upsert
        })

      if (error) throw error

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      return {
        ...data,
        publicUrl: urlData.publicUrl,
        filePath,
        fileName,
        bucket
      }
    }
  })
}

/**
 * Hook para upload múltiplo de arquivos
 */
export function useUploadMultipleFiles() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      files,
      options = {}
    }: {
      files: File[]
      options?: UploadOptions
    }) => {
      const {
        bucket = STORAGE_BUCKETS.MEDIA,
        folder = STORAGE_FOLDERS.RAW,
        contentType,
        cacheControl = '3600',
        upsert = false
      } = options

      const uploadPromises = files.map(async (file) => {
        const filePath = folder ? `${folder}/${file.name}` : file.name

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            contentType: contentType || file.type,
            cacheControl,
            upsert
          })

        if (error) throw error

        // Obter URL pública do arquivo
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath)

        return {
          ...data,
          publicUrl: urlData.publicUrl,
          filePath,
          fileName: file.name,
          bucket,
          originalFile: file
        }
      })

      const results = await Promise.all(uploadPromises)
      return results
    }
  })
}

/**
 * Hook para deletar arquivo
 */
export function useDeleteFile() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      filePath,
      bucket = STORAGE_BUCKETS.MEDIA
    }: {
      filePath: string
      bucket?: string
    }) => {
      const { error } = await supabase.storage.from(bucket).remove([filePath])

      if (error) throw error

      return { filePath, bucket }
    }
  })
}

/**
 * Hook para listar arquivos em um bucket/pasta
 */
export function useListFiles(
  bucket: string = STORAGE_BUCKETS.MEDIA,
  folder?: string,
  enabled = true
) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['storage-files', bucket, folder],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(bucket).list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      })

      if (error) throw error

      // Adicionar URLs públicas
      const filesWithUrls = data?.map((file) => {
        const filePath = folder ? `${folder}/${file.name}` : file.name
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath)

        return {
          ...file,
          publicUrl: urlData.publicUrl,
          filePath
        }
      })

      return filesWithUrls || []
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000 // 10 minutos
  })
}

/**
 * Hook para obter URL pública de um arquivo
 */
export function useFileUrl(
  filePath: string,
  bucket: string = STORAGE_BUCKETS.MEDIA,
  enabled = true
) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['file-url', bucket, filePath],
    queryFn: () => {
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

      return data.publicUrl
    },
    enabled: enabled && !!filePath,
    staleTime: Infinity, // URLs não mudam
    cacheTime: Infinity
  })
}

/**
 * Hook para gerar URL de download de arquivo
 */
export function useDownloadFile() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      filePath,
      bucket = STORAGE_BUCKETS.MEDIA
    }: {
      filePath: string
      bucket?: string
    }) => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath)

      if (error) throw error

      // Criar URL temporária para download
      const url = URL.createObjectURL(data)

      return {
        blob: data,
        url,
        filePath,
        bucket
      }
    }
  })
}

/**
 * Hook para move/rename arquivo
 */
export function useMoveFile() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      fromPath,
      toPath,
      bucket = STORAGE_BUCKETS.MEDIA
    }: {
      fromPath: string
      toPath: string
      bucket?: string
    }) => {
      const { error } = await supabase.storage
        .from(bucket)
        .move(fromPath, toPath)

      if (error) throw error

      return { fromPath, toPath, bucket }
    }
  })
}

/**
 * Utility function para validar tipos de arquivo
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.includes(file.type)
}

/**
 * Utility function para validar tamanho do arquivo
 */
export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}

/**
 * Utility function para gerar nome único de arquivo
 */
export const generateUniqueFileName = (
  originalName: string,
  prefix?: string
): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2)
  const extension = originalName.split('.').pop()
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '')

  const uniqueName = prefix
    ? `${prefix}_${nameWithoutExtension}_${timestamp}_${random}.${extension}`
    : `${nameWithoutExtension}_${timestamp}_${random}.${extension}`

  return uniqueName
}
