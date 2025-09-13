/**
 * Exemplo de uso do ImageUploadService
 *
 * Este arquivo demonstra como usar o novo serviço de upload de imagens
 * em diferentes contextos.
 */

import { ImageUploadService } from '@/services/image-upload.service'
import { createClient } from '@/utils/supabase/client'

// Exemplo 1: Upload básico em um componente
export async function handleImageUpload(file: File, resourceType = 'artworks') {
  const supabase = createClient()

  try {
    const result = await ImageUploadService.uploadImageWithValidation(
      file,
      supabase,
      resourceType
    )

    console.log('Upload successful:', {
      optimized: result.optimizedPath,
      raw: result.rawPath
    })

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Upload failed'
    console.error('Upload failed:', errorMessage)
    throw error
  }
}

// Exemplo 2: Upload com validação manual
export async function handleCustomUpload(file: File) {
  const supabase = createClient()

  try {
    // Validar primeiro
    ImageUploadService.validateImageFile(file)

    // Fazer upload sem validação automática
    const result = await ImageUploadService.uploadImage(
      file,
      supabase,
      'custom-folder'
    )

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    if (errorMessage.includes('Invalid file type')) {
      alert('Please select a valid image file (JPEG, PNG, WebP, GIF)')
    } else if (errorMessage.includes('File too large')) {
      alert('File is too large. Maximum size is 10MB.')
    } else {
      alert('Upload failed. Please try again.')
    }

    throw error
  }
}

// Exemplo 3: Uso em formulário com React Hook Form
export function useImageUploadForm() {
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const supabase = createClient()

    try {
      const result = await ImageUploadService.uploadImageWithValidation(
        file,
        supabase,
        'artworks'
      )

      // Atualizar campos do formulário
      // setValue('image_url', result.optimizedPath)
      // setValue('raw_image_url', result.rawPath)

      return result
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  return { handleFileSelect }
}
