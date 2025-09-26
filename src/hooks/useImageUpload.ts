import { useState } from 'react'
import { toast } from 'sonner'

export interface UseImageUploadResult {
  uploading: boolean
  originalUrl: string | null
  optimizedUrl: string | null
  uploadImage: (
    file: File,
    id: string,
    supabase: any
  ) => Promise<{ originalUrl: string | null; optimizedUrl: string | null }>
  resetUploadState: () => void
}

/**
 * Hook para otimizar (resize, webp) e subir imagem original e otimizada para Supabase Storage.
 * - Redimensiona para no máximo 1920x1080 (mantendo proporção)
 * - Converte otimizada para webp
 * - Sobe original em images/{id}.{ext} e otimizada em images/optimized/{id}.webp
 * - Retorna URLs públicas de ambas
 */
export function useImageUpload(): UseImageUploadResult {
  const [uploading, setUploading] = useState(false)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [optimizedUrl, setOptimizedUrl] = useState<string | null>(null)

  async function uploadImage(file: File, id: string, supabase: any) {
    setUploading(true)
    setOriginalUrl(null)
    setOptimizedUrl(null)
    let finalOriginalUrl: string | null = null
    let finalOptimizedUrl: string | null = null
    try {
      // 1. Upload original
      const ext = file.name.split('.').pop() || 'jpg'
      const originalFilename = `${id}.${ext}`
      const originalPath = `images/${originalFilename}`
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(originalPath, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: originalData } = supabase.storage
        .from('media')
        .getPublicUrl(originalPath)
      setOriginalUrl(originalData.publicUrl)
      finalOriginalUrl = originalData.publicUrl

      // 2. Otimizar imagem (resize + webp)
      const optimizedBlob = await optimizeImageWithCanvas(file)
      const optimizedFilename = `${id}.webp`
      const optimizedPath = `images/optimized/${optimizedFilename}`
      const { error: optError } = await supabase.storage
        .from('media')
        .upload(optimizedPath, optimizedBlob, {
          upsert: true,
          contentType: 'image/webp'
        })
      if (optError) throw optError
      const { data: optimizedData } = supabase.storage
        .from('media')
        .getPublicUrl(optimizedPath)
      setOptimizedUrl(optimizedData.publicUrl)
      finalOptimizedUrl = optimizedData.publicUrl
      toast.success('Imagem original e otimizada enviadas!')
      return { originalUrl: finalOriginalUrl, optimizedUrl: finalOptimizedUrl }
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? (err as Error).message
          : String(err)
      toast.error('Erro ao enviar imagem: ' + msg)
      return { originalUrl: finalOriginalUrl, optimizedUrl: finalOptimizedUrl }
    } finally {
      setUploading(false)
    }
  }

  function resetUploadState() {
    setUploading(false)
    setOriginalUrl(null)
    setOptimizedUrl(null)
  }

  return { uploading, originalUrl, optimizedUrl, uploadImage, resetUploadState }
}

/**
 * Otimiza imagem usando canvas: resize para 1920x1080 máx, converte para webp
 */
async function optimizeImageWithCanvas(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      const maxW = 1920
      const maxH = 1080
      let { width, height } = img
      let scale = Math.min(maxW / width, maxH / height, 1)
      width = Math.round(width * scale)
      height = Math.round(height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Erro ao converter para webp'))
        },
        'image/webp',
        0.92
      )
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
