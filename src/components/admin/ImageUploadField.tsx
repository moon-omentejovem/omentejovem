import { useImageUpload } from '@/hooks/useImageUpload'
import axios from 'axios'
import { FileInput, Label } from 'flowbite-react'
import Image from 'next/image'
import React from 'react'

interface ImageUploadFieldProps {
  defaultValue?: string | null
  supabase: any
  onChange: (value: string | null) => void
  onExtraChange?: (key: string, value: any) => void
  label?: string
  placeholder?: string
  error?: string
  mode?: 'image' | 'video'
  accept?: string
  maxSizeMB?: number
  fieldKey?: string
}

export default function ImageUploadField({
  supabase,
  defaultValue,
  onChange,
  onExtraChange,
  label,
  placeholder,
  error,
  mode = 'image',
  accept,
  maxSizeMB,
  fieldKey
}: ImageUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    defaultValue || null
  )
  React.useEffect(() => {
    setPreviewUrl(defaultValue || null)
  }, [defaultValue])

  const [videoUploading, setVideoUploading] = React.useState(false)

  const { uploading, uploadImage, resetUploadState } = useImageUpload()
  // Gera um id estável para o upload
  const [uploadId] = React.useState(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15)
  )

  const isVideoMode = mode === 'video'
  const effectiveAccept =
    accept ||
    (isVideoMode
      ? 'video/mp4,video/webm,video/quicktime'
      : 'image/*')
  const effectiveMaxSizeMB = maxSizeMB || (isVideoMode ? 100 : 300)
  const isUploading = isVideoMode ? videoUploading : uploading

  const uploadVideoToB2 = async (file: File, filename: string) => {
    const contentType = file.type || 'video/mp4'
    const res = await axios.post('/api/upload', {
      filename,
      contentType
    })
    const { signedUrl, publicUrl } = res.data
    await axios.put(signedUrl, file, {
      headers: {
        'Content-Type': contentType
      }
    })
    return publicUrl as string
  }

  const handleUpload = async (file: File) => {
    const limitBytes = effectiveMaxSizeMB * 1024 * 1024

    if (file.size > limitBytes) {
      alert(
        isVideoMode
          ? `O vídeo excede o limite máximo de ${effectiveMaxSizeMB}MB.`
          : `A imagem excede o limite máximo de ${effectiveMaxSizeMB}MB.`
      )
      return
    }

    if (isVideoMode) {
      try {
        setVideoUploading(true)
        const ext = file.name.split('.').pop() || 'mp4'
        const filename = `video/${uploadId}.${ext}`
        const publicUrl = await uploadVideoToB2(file, filename)
        setPreviewUrl(publicUrl)
        if (onExtraChange && fieldKey) {
          onExtraChange(fieldKey, publicUrl)
        }
        onChange(publicUrl)
      } catch (err) {
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? (err as Error).message
            : String(err)
        alert('Erro ao enviar vídeo: ' + msg)
      } finally {
        setVideoUploading(false)
      }
    } else {
      const { originalUrl, optimizedUrl } = await uploadImage(
        file,
        uploadId
      )
      const ext = file.name.split('.').pop()
      const filename = `${uploadId}.${ext}`
      onExtraChange && onExtraChange('filename', filename)
      if (optimizedUrl) {
        setPreviewUrl(optimizedUrl)
        onExtraChange && onExtraChange('imageoptimizedurl', optimizedUrl)
        onChange(optimizedUrl)
      }
      if (originalUrl) {
        setPreviewUrl(originalUrl)
        onExtraChange && onExtraChange('imageurl', originalUrl)
        onChange(originalUrl)
      }
    }
  }
  const handleRemove = () => {
    setPreviewUrl(null)
    if (isVideoMode) {
      if (onExtraChange && fieldKey) {
        onExtraChange(fieldKey, null)
      }
    } else {
      onExtraChange && onExtraChange('imageoptimizedurl', null)
      onExtraChange && onExtraChange('imageurl', null)
    }
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
    resetUploadState()
  }
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await handleUpload(file)
  }
  return (
    <div className="space-y-2">
      {label && <Label htmlFor="image-upload" value={label} />}
      <div className="flex items-center gap-2">
        <FileInput
          accept={effectiveAccept}
          onChange={handleFileChange}
          sizing="lg"
          placeholder={
            placeholder ||
            (isVideoMode ? 'Upload a video' : 'Upload an image')
          }
          disabled={isUploading}
          value={undefined}
          ref={inputRef}
        />
        {isUploading && (
          <span className="text-xs text-gray-400">Enviando...</span>
        )}
      </div>
      <div className="mt-2 relative w-fit">
        {previewUrl ? (
          <>
            {isVideoMode ? (
              <video
                src={previewUrl}
                className="w-80 max-w-full rounded-lg border border-gray-200"
                controls
              >
                <track kind="captions" />
              </video>
            ) : (
              <Image
                src={previewUrl}
                alt="Preview"
                width={320}
                height={320}
                className="object-cover rounded-lg border border-gray-200"
                unoptimized
              />
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg hover:bg-red-600 transition z-10"
              title={isVideoMode ? 'Remover vídeo' : 'Remover imagem'}
              style={{ zIndex: 10 }}
            >
              <span className="text-xs font-bold leading-none">×</span>
            </button>
          </>
        ) : (
          <span className="text-xs text-gray-400">
            {isVideoMode ? 'Nenhum vídeo cadastrado' : 'Nenhuma imagem cadastrada'}
          </span>
        )}
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}
