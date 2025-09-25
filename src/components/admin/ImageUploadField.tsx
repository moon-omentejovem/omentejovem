import { useImageUpload } from '@/hooks/useImageUpload'
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
}

export default function ImageUploadField({
  supabase,
  defaultValue,
  onChange,
  onExtraChange,
  label,
  placeholder,
  error
}: ImageUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    defaultValue || null
  )
  React.useEffect(() => {
    setPreviewUrl(defaultValue || null)
  }, [defaultValue])

  const { uploading, uploadImage, resetUploadState } = useImageUpload()
  // Gera um id estável para o upload
  const [uploadId] = React.useState(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15)
  )

  const handleUpload = async (file: File) => {
    const { originalUrl, optimizedUrl } = await uploadImage(
      file,
      uploadId,
      supabase
    )
    const ext = file.name.split('.').pop()
    const filename = `${uploadId}.${ext}`
    onExtraChange && onExtraChange('filename', filename)
    if (optimizedUrl) {
      setPreviewUrl(optimizedUrl)
      onExtraChange && onExtraChange('imageoptimizedurl', optimizedUrl)
      onChange(optimizedUrl)
    } else if (originalUrl) {
      setPreviewUrl(originalUrl)
      onExtraChange && onExtraChange('imageurl', originalUrl)
      onChange(originalUrl)
    }
  }
  const handleRemove = () => {
    setPreviewUrl(null)
    onExtraChange && onExtraChange('imageoptimizedurl', null)
    onExtraChange && onExtraChange('imageurl', null)
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
          accept="image/*"
          onChange={handleFileChange}
          sizing="lg"
          placeholder={placeholder || 'Upload an image'}
          disabled={uploading}
          value={undefined}
          ref={inputRef}
        />
        {uploading && (
          <span className="text-xs text-gray-400">Enviando...</span>
        )}
      </div>
      <div className="mt-2 relative w-fit">
        {previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt="Preview"
              width={320}
              height={320}
              className="object-cover rounded-lg border border-gray-200"
              unoptimized
            />
            {previewUrl !== defaultValue && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 bg-white/80 rounded-full p-1 shadow hover:bg-red-100 transition z-10"
                title="Remover imagem"
                style={{ zIndex: 10 }}
              >
                <span className="text-red-600 font-bold text-lg">×</span>
              </button>
            )}
          </>
        ) : (
          <span className="text-xs text-gray-400">
            Nenhuma imagem cadastrada
          </span>
        )}
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}
