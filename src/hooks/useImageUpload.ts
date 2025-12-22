import { useState } from 'react'
import { toast } from 'sonner'
import axios from 'axios'

export interface UseImageUploadResult {
  uploading: boolean
  originalUrl: string | null
  optimizedUrl: string | null
  uploadImage: (
    file: File,
    id: string
  ) => Promise<{ originalUrl: string | null; optimizedUrl: string | null }>
  resetUploadState: () => void
}

/**
 * Hook para otimizar (resize, webp) e subir imagem original e otimizada para Backblaze B2.
 * - Redimensiona para no máximo 1920x1080 (mantendo proporção)
 * - Converte otimizada para webp
 * - Sobe original em images/{id}.{ext} e otimizada em images/optimized/{id}.webp
 * - Retorna URLs públicas de ambas
 */
export function useImageUpload(): UseImageUploadResult {
  const [uploading, setUploading] = useState(false)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [optimizedUrl, setOptimizedUrl] = useState<string | null>(null)

  async function getSignedUrl(filename: string, contentType: string) {
    const res = await axios.post('/api/upload', { filename, contentType })
    return res.data
  }

  async function uploadToB2(
    file: File | Blob,
    filename: string,
    contentType: string
  ) {
    const { signedUrl, publicUrl } = await getSignedUrl(filename, contentType)
    await axios.put(signedUrl, file, {
      headers: {
        'Content-Type': contentType
      }
    })
    return publicUrl
  }

  async function uploadImage(file: File, id: string) {
    setUploading(true)
    setOriginalUrl(null)
    setOptimizedUrl(null)
    let finalOriginalUrl: string | null = null
    let finalOptimizedUrl: string | null = null
    try {
      // 1. Upload original
      const ext = file.name.split('.').pop() || 'jpg'
      const originalFilename = `images/${id}.${ext}`
      
      finalOriginalUrl = await uploadToB2(file, originalFilename, file.type)
      setOriginalUrl(finalOriginalUrl)

      // 2. Otimizar imagem (resize + webp)
      const optimizedBlob = await optimizeImageWithCanvas(file)
      const optimizedFilename = `images/optimized/${id}.webp`
      
      finalOptimizedUrl = await uploadToB2(optimizedBlob, optimizedFilename, 'image/webp')
      setOptimizedUrl(finalOptimizedUrl)

      toast.success('Imagem original e otimizada enviadas para B2!')
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
